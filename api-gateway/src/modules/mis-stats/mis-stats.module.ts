// src/modules/mis-stats/mis-stats.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { MisStatsController } from './mis-stats.controller';

/**
 * Module that exposes "mis-stats" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [MisStatsController],
})
export class MisStatsModule {}
