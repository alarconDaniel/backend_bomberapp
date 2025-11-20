// src/modules/public/trofeo/trofeo.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { TrofeoController } from './trofeo.controller';

/**
 * Module that exposes "trofeo" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [TrofeoController],
})
export class TrofeoModule {}
