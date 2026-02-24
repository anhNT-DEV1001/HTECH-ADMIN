import * as dotenv from 'dotenv';
dotenv.config();
export const key = {
  app: {
    host: String(process.env.HOST),
    port: Number(process.env.PORT ?? 5000),
    name: String(process.env.APP_NAME),
    env: String(process.env.NODE_ENV),
  },
  web: {
    url: String(process.env.FRONTEND_URL),
  },
  jwt: {
    access_secret: String(process.env.ACCESS_SECRET),
    access_exprise: String(process.env.ACCESS_EXPRISEIN),
    refresh_secret: String(process.env.REFRESH_SECRET),
    refresh_exprise: String(process.env.REFRESH_EXPRISEIN),
  },
};

export const isPord = key.app.env === 'production' ? true : false;
