// src/modules/respuestas/respuestas.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { RespuestasController } from './respuestas.controller';

/**
 * Module that exposes "respuestas" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [RespuestasController],
})
export class RespuestasModule {}
