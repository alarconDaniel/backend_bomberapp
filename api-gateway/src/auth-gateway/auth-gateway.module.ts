import { Module } from '@nestjs/common';
import { AuthGatewayController } from './auth-gateway.controller';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [AuthGatewayController],
})
export class AuthGatewayModule {}
