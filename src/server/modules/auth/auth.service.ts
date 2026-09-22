import crypto from 'node:crypto';
import { signToken, verifyPassword, hashPassword, generateNonce, generatePkcePair, verifyOidcIdToken, authCookieOptions } from '../../../shared/utils/auth';
import { authRepository } from './auth.repository';
import type { LoginResponse, TelegramTokenExchangeResponse } from './auth.types';
import { AuthenticationError, NotFoundError, ValidationError } from '../../platform/errors/index';
import { getRedisStore } from '../../platform/integrations/redis/redisClient';
import { env } from '../../platform/config/env';
import type * as jose from 'jose';

const TELEGRAM_DISCOVERY_URL = 'https://oauth.telegram.org/.well-known/openid-configuration';
const OIDC_CONFIG_TTL_MS = 60 * 60 * 1000; // 1 hour

interface OidcDiscoveryConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
}

let cachedOidcConfig: OidcDiscoveryConfig | null = null;
let cachedOidcConfigAt = 0;

async function getOidcConfig(): Promise<OidcDiscoveryConfig> {
  const now = Date.now();
  if (cachedOidcConfig && now - cachedOidcConfigAt < OIDC_CONFIG_TTL_MS) {
    return cachedOidcConfig;
  }

  try {
    const res = await fetch(TELEGRAM_DISCOVERY_URL);
    if (res.ok) {
      cachedOidcConfig = (await res.json()) as OidcDiscoveryConfig;
      cachedOidcConfigAt = Date.now();
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
  cachedOidcConfigAt = Date.now();

  return cachedOidcConfig;
}

import { TEN_MINUTES_SECONDS } from '../../../shared/constants/index';

const oidcStateKey = (state: string) => `fb:oidc:state:${state}`;

export const authService = {
  async initiateOidcFlow(redirectUri: string) {
    const config = await getOidcConfig();
    const clientId = env.TELEGRAM_OPENID_CONNECT_CLIENT_ID?.trim();
    if (!clientId) {
      throw new ValidationError('TELEGRAM_OPENID_CONNECT_CLIENT_ID is not configured.');
    }

    const state = crypto.randomBytes(16).toString('hex');
    const nonce = generateNonce();
    const { codeVerifier, codeChallenge } = generatePkcePair();

    await getRedisStore().set(
      oidcStateKey(state),
      JSON.stringify({ nonce, codeVerifier }),
      TEN_MINUTES_SECONDS
    );

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
    jwksOverride?: jose.JWTVerifyGetKey;
  }): Promise<LoginResponse> {
    const { code, state, redirectUri, jwksOverride } = params;

    const key = oidcStateKey(state);
    const store = getRedisStore();
    const raw = await store.get(key);
    await store.del(key);

    if (!raw) {
      throw new AuthenticationError('Invalid OAuth state parameter (CSRF check failed).');
    }

    let stored: { nonce: string; codeVerifier: string };
    try {
      stored = JSON.parse(raw);
    } catch {
      throw new AuthenticationError('Invalid OAuth state data.');
    }

    const { nonce, codeVerifier } = stored;

    if (!codeVerifier) {
      throw new AuthenticationError('Missing PKCE code verifier.');
    }

    const clientId = env.TELEGRAM_OPENID_CONNECT_CLIENT_ID?.trim();
    const clientSecret = env.TELEGRAM_OPENID_CONNECT_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
      throw new ValidationError('Telegram OIDC Client ID or Client Secret is not configured.');
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

  async updateProfile(userId: string, data: { name?: string; telegramPhone?: string; notifyViaTelegram?: boolean; dietaryPreferences?: string[]; language?: string; }) {
    const user = await authRepository.updateProfile(userId, data);
    return authRepository.toPublic(user);
  },

  authCookieOptions,
};
