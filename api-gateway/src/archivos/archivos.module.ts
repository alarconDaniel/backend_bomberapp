// src/archivos/archivos.gateway.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { ArchivosGatewayController } from './archivos.controller';

/**
 * Gateway module that exposes "archivos" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [ArchivosGatewayController],
})
export class ArchivosGatewayModule {}
