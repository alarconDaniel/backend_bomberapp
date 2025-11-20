// src/modules/public/uploads/uploads.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { UploadsController } from './uploads.controller';

/**
 * Module that exposes "uploads" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
