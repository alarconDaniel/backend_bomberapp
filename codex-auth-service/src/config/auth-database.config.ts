import { registerAs } from '@nestjs/config';

export interface AuthDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
}

export const AUTH_DATABASE = 'authDatabase';

export default registerAs<AuthDatabaseConfig>(AUTH_DATABASE, () => ({
  host: process.env.AUTH_DB_HOST ?? 'localhost',
  port: parseInt(process.env.AUTH_DB_PORT ?? '3306', 10),
  username: process.env.AUTH_DB_USERNAME ?? 'bomberapp_auth',
  password: process.env.AUTH_DB_PASSWORD ?? 'bomberapp_auth',
  database: process.env.AUTH_DB_NAME ?? 'bomberapp_auth',
  synchronize: (process.env.AUTH_DB_SYNCHRONIZE ?? 'false') === 'true',
}));
