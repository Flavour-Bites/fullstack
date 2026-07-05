import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_do_not_use_in_prod';
const JWT_EXPIRES = '30d';
const BCRYPT_ROUNDS = 12;

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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function verifyTelegramAuth(data: TelegramAuthData): boolean {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!BOT_TOKEN || !data?.hash || !data?.auth_date || !data?.id) {
    return false;
  }

  const MAX_AGE_SECONDS = 86400;
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > MAX_AGE_SECONDS) {
    return false;
  }

  const { hash, ...rest } = data;
  const dataCheckString = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key as keyof typeof rest]}`)
    .join('\n');

  const secretKey = crypto
    .createHash('sha256')
    .update(BOT_TOKEN)
    .digest();

  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const expected = Buffer.from(expectedHash, 'hex');
  const actual = Buffer.from(hash, 'hex');
  if (expected.length !== actual.length) return false;

  return crypto.timingSafeEqual(expected, actual);
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
