// src/modules/public/item-tienda/item-tienda.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { ItemTiendaController } from './item-tienda.controller';

/**
 * Module that exposes "item-tienda" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [ItemTiendaController],
})
export class ItemTiendaModule {}
