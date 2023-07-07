import { ConfigProps } from './config.interface';

export const config = (): ConfigProps => ({
  PORT: parseInt(process.env.PORT, 10) || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  API: {
    // API_URL: process.env.API_URL,
    // HTTP_TIMEOUT: 1000,
    RATE_LIMIT_TTL: +process.env.THROTTLE_TTL,
    RATE_LIMIT: +process.env.THROTTLE_LIMIT,
  },
  DB: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: +process.env.DB_PORT,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,
    DB_SYNC: process.env.DB_SYNC === 'true',
  },
});
