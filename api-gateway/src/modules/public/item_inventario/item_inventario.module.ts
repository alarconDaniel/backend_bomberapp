// src/modules/public/item_inventario/item_inventario.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { ItemInventarioController } from './item_inventario.controller';

/**
 * Module that exposes "item-inventario" endpoints
 * and forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule, // used to read the RETOS_URL configuration value
  ],
  controllers: [ItemInventarioController],
})
export class ItemInventarioModule {}
