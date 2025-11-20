// src/modules/public/ranking/ranking.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { RankingController } from './ranking.controller';

/**
 * Module that exposes "ranking" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [RankingController],
})
export class RankingModule {}
