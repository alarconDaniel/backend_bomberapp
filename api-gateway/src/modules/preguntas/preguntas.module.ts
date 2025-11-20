// src/modules/preguntas/preguntas.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { PreguntasController } from './preguntas.controller';

/**
 * Module that exposes "preguntas" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [PreguntasController],
})
export class PreguntasModule {}
