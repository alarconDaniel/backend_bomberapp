// src/modules/mi-perfil/mi-perfil.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { PerfilController } from './mi-perfil.controller';

/**
 * Module that exposes "mi-perfil" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [PerfilController],
})
export class MiPerfilModule {}
