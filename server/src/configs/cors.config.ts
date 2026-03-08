import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { key } from './key.config';

export const corsConfig: CorsOptions = {
  // origin: ['*', key.web.url],
  origin: [key.web.htech_url_local, key.web.htech_url , key.web.url],
  // origin: ['http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization, Accept, X-Requested-With',
  credentials: true,
};
