// src/modules/public/usuario-logro/usuario-logro.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { UsuarioLogroController } from './usuario-logro.controller';

/**
 * Module that exposes "mis-logros" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [UsuarioLogroController],
})
export class UsuarioLogroModule {}
