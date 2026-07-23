import crypto from 'crypto';
import { signToken, verifyPassword, hashPassword, generateNonce, generatePkcePair, verifyOidcIdToken, authCookieOptions } from '../../../shared/utils/auth';
import { authRepository } from './auth.repository';
import type { LoginResponse, TelegramTokenExchangeResponse } from './auth.types';
import { AuthenticationError, NotFoundError } from '../../../shared/errors/index';

const TELEGRAM_DISCOVERY_URL = 'https://oauth.telegram.org/.well-known/openid-configuration';

interface OidcDiscoveryConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
}

let cachedOidcConfig: OidcDiscoveryConfig | null = null;

async function getOidcConfig(): Promise<OidcDiscoveryConfig> {
  if (cachedOidcConfig) return cachedOidcConfig;

  try {
    const res = await fetch(TELEGRAM_DISCOVERY_URL);
    if (res.ok) {
      cachedOidcConfig = (await res.json()) as OidcDiscoveryConfig;
      return cachedOidcConfig;
    }
  } catch {
    // Fallback to official Telegram OIDC spec endpoints if discovery endpoint is unreachable
  }

  cachedOidcConfig = {
    issuer: 'https://oauth.telegram.org',
    authorization_endpoint: 'https://oauth.telegram.org/auth',
    token_endpoint: 'https://oauth.telegram.org/token',
    jwks_uri: 'https://oauth.telegram.org/.well-known/jwks.json',
  };

  return cachedOidcConfig;
}

const oidcStateStore = new Map<string, { nonce: string; codeVerifier: string }>();

setInterval(() => oidcStateStore.clear(), 10 * 60 * 1000);

export const authService = {
  async initiateOidcFlow(redirectUri: string) {
    const config = await getOidcConfig();
    const clientId = process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID?.trim();
    if (!clientId) {
      throw new Error('TELEGRAM_OPENID_CONNECT_CLIENT_ID is not configured.');
    }

    const state = crypto.randomBytes(16).toString('hex');
    const nonce = generateNonce();
    const { codeVerifier, codeChallenge } = generatePkcePair();

    oidcStateStore.set(state, { nonce, codeVerifier });
    setTimeout(() => oidcStateStore.delete(state), 10 * 60 * 1000);

    const authUrl = new URL(config.authorization_endpoint);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid profile phone telegram:bot_access');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    return {
      authorizationUrl: authUrl.toString(),
      state,
    };
  },

  async handleOidcCallback(params: {
    code: string;
    state: string;
    redirectUri: string;
    jwksOverride?: any;
  }): Promise<LoginResponse> {
    const { code, state, redirectUri, jwksOverride } = params;

    const stored = oidcStateStore.get(state);
    oidcStateStore.delete(state);

    if (!stored) {
      throw new AuthenticationError('Invalid OAuth state parameter (CSRF check failed).');
    }

    const { nonce, codeVerifier } = stored;

    if (!codeVerifier) {
      throw new AuthenticationError('Missing PKCE code verifier.');
    }

    const clientId = process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID?.trim();
    const clientSecret = process.env.TELEGRAM_OPENID_CONNECT_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
      throw new Error('Telegram OIDC Client ID or Client Secret is not configured.');
    }

    const config = await getOidcConfig();

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    });

    const tokenRes = await fetch(config.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new AuthenticationError(`Token exchange failed: ${errText || tokenRes.statusText}`);
    }

    const tokenData = (await tokenRes.json()) as TelegramTokenExchangeResponse;
    if (!tokenData.id_token) {
      throw new AuthenticationError('No id_token received from Telegram OIDC token endpoint.');
    }

    const claims = await verifyOidcIdToken(tokenData.id_token, nonce, jwksOverride);

    const telegramUserId = String(claims.id ?? claims.sub);
    const user = await authRepository.upsertTelegramUser({
      id: telegramUserId,
      name: claims.name,
      first_name: claims.given_name,
      last_name: claims.family_name,
      username: claims.preferred_username,
      photo_url: claims.picture,
      phone_number: claims.phone_number,
    });

    if (user.passwordHash) {
      return { success: true, needsPassword: true, telegramId: user.telegramId };
    }

    const token = signToken({ userId: user.id, role: user.role });
    return {
      success: true,
      token,
      user: authRepository.toPublic(user),
    };
  },

  async finalizeTelegramLogin(telegramId: string, password: string): Promise<LoginResponse> {
    const user = await authRepository.findByTelegramId(telegramId);
    if (!user) throw new NotFoundError('Account not found.');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new AuthenticationError('That password is not correct.');

    const token = signToken({ userId: user.id, role: user.role });
    return { success: true, token, user: authRepository.toPublic(user) };
  },

  async setPassword(userId: string, password: string): Promise<void> {
    const hashed = await hashPassword(password);
    await authRepository.updatePassword(userId, hashed);
  },

  async verifyUserPassword(userId: string, password: string): Promise<boolean> {
    const user = await authRepository.findById(userId);
    return verifyPassword(password, user?.passwordHash);
  },

  async telegramPasswordLogin(telegramId: string, password: string): Promise<LoginResponse> {
    const user = await authRepository.findByTelegramId(telegramId);
    if (!user) throw new NotFoundError('Account not found.');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new AuthenticationError('That Telegram ID or password is not correct.');

    const token = signToken({ userId: user.id, role: user.role });
    return { success: true, token, user: authRepository.toPublic(user) };
  },

  async getCurrentUser(userId: string): Promise<LoginResponse['user']> {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('Account not found.');
    return authRepository.toPublic(user);
  },

  authCookieOptions,
};
