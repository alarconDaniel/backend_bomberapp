import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTtl: string;
  refreshTtl: string;
  issuer: string;
  audience?: string;
}

export const AUTH_JWT = 'authJwt';

export default registerAs<JwtConfig>(AUTH_JWT, () => ({
  accessSecret:
    process.env.AUTH_JWT_ACCESS_SECRET ??
    process.env.JWT_SECRET ??
    'dev_access_secret',
  refreshSecret:
    process.env.AUTH_JWT_REFRESH_SECRET ??
    process.env.JWT_SECRET ??
    'dev_refresh_secret',
  accessTtl: process.env.AUTH_JWT_ACCESS_TTL ?? '15m',
  refreshTtl: process.env.AUTH_JWT_REFRESH_TTL ?? '7d',
  issuer: process.env.AUTH_JWT_ISSUER ?? 'bomberapp-auth',
  audience: process.env.AUTH_JWT_AUDIENCE,
}));
