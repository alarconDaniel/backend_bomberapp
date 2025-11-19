import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AuthGatewayController } from './auth-gateway.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * Module that exposes authentication gateway endpoints and
 * delegates authentication logic to the AuthModule and identity-service.
 */
@Module({
  imports: [AuthModule, HttpModule],
  controllers: [AuthGatewayController],
})
export class AuthGatewayModule {}
