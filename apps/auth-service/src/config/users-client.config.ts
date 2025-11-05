import { registerAs } from '@nestjs/config';

export interface UsersClientConfig {
  baseUrl: string;
  timeout: number;
}

export const USERS_CLIENT = 'usersClient';

export default registerAs<UsersClientConfig>(USERS_CLIENT, () => ({
  baseUrl: process.env.USERS_SERVICE_URL ?? 'http://localhost:3000',
  timeout: parseInt(process.env.USERS_SERVICE_TIMEOUT ?? '5000', 10),
}));
