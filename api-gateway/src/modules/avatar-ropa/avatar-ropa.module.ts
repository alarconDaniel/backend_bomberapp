import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { AvatarRopaGatewayController } from './avatar-ropa.controller';

/**
 * Gateway module that exposes "avatar/ropa" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [AvatarRopaGatewayController],
})
export class AvatarRopaGatewayModule {}
