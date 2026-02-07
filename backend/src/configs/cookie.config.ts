import { CookieOptions } from 'express';
import { isPord } from './key.config';

export const getCookieConfig = {
  accessToken: {
    httpOnly: true,
    secure: isPord,
    sameSite: isPord ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24,
    path: '/',
    domain: isPord ? '.your-production-domain.com' : undefined,
  },
  refreshToken: {
    httpOnly: true,
    secure: isPord,
    sameSite: isPord ? 'none' : 'lax',
    path: '/api/v1/auth/refresh',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    domain: isPord ? '.your-production-domain.com' : undefined,
  },
} as { accessToken: CookieOptions; refreshToken: CookieOptions };
