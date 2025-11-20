// src/mis-retos/mis-retos.gateway.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { MisRetosGatewayController } from './mis-retos.controller';

/**
 * Gateway module that exposes "mis-retos" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [MisRetosGatewayController],
})
export class MisRetosGatewayModule {}
