import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './src/infrastructure/prisma/schema/',
  migrations: {
    path: 'src/infrastructure/prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
