// src/modules/catalogos/catalogos.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { CatalogosController } from './catalogos.controller';

/**
 * Module that exposes "catalogos" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [CatalogosController],
})
export class CatalogosModule {}
