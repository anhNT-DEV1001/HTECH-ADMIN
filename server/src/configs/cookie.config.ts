import { CookieOptions } from 'express';
import { isPord, isVps, key } from './key.config';

export const getCookieConfig = {
  accessToken: {
    httpOnly: true,
    secure: isPord,
    sameSite: isVps ? 'lax' : 'lax',
    maxAge: 1000 * 60 * 60 * 24,
    path: '/',
    domain: isVps ? key.app.domain_fe : 'localhost',
  },
  refreshToken: {
    httpOnly: true,
    secure: isPord,
    sameSite: isVps ? 'lax' : 'lax',
    path: '/api/v1/auth/refresh',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    domain: isVps ? key.app.domain_fe : 'localhost',
  },
} as { accessToken: CookieOptions; refreshToken: CookieOptions };
