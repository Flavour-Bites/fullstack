import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const JWT_EXPIRES = '30d';
const BCRYPT_ROUNDS = 12;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return secret;
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_ROUNDS);

export const verifyPassword = (plain: string, hashed?: string | null) => {
  if (!hashed) return Promise.resolve(false);
  return bcrypt.compare(plain, hashed);
};

export interface TokenPayload {
  userId: string;
  role: 'customer' | 'staff' | 'admin';
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}

import * as jose from 'jose';

const TELEGRAM_JWKS_URL = 'https://oauth.telegram.org/.well-known/jwks.json';
export const TELEGRAM_ISSUER = 'https://oauth.telegram.org';

let remoteJWKS: jose.JWTVerifyGetKey | null = null;

export function getTelegramJWKS() {
  if (!remoteJWKS) {
    remoteJWKS = jose.createRemoteJWKSet(new URL(TELEGRAM_JWKS_URL));
  }
  return remoteJWKS;
}

export function setTelegramJWKSSupplier(supplier: jose.JWTVerifyGetKey | null) {
  remoteJWKS = supplier;
}

export function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generatePkcePair() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { codeVerifier: verifier, codeChallenge: challenge };
}

export interface OidcIdTokenPayload {
  iss: string;
  aud: string;
  sub: string;
  iat: number;
  exp: number;
  nonce?: string;
  id?: number;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
}

export async function verifyOidcIdToken(
  idToken: string,
  expectedNonce?: string,
  jwksOverride?: jose.JWTVerifyGetKey
): Promise<OidcIdTokenPayload> {
  const clientId = process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error('TELEGRAM_OPENID_CONNECT_CLIENT_ID is not configured.');
  }

  const JWKS = jwksOverride || getTelegramJWKS();
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: TELEGRAM_ISSUER,
    audience: clientId,
  });

  const claims = payload as unknown as OidcIdTokenPayload;

  if (expectedNonce && claims.nonce !== expectedNonce) {
    throw new Error('Invalid nonce in ID token.');
  }

  return claims;
}

export function getTokenFromRequest(req: { cookies?: Record<string, string>; headers: Record<string, any> }) {
  const cookieToken = req.cookies?.auth_token;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};
