// src/mis-retos/mis-retos.gateway.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MisRetosGatewayController } from './mis-retos.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule, // para leer RETOS_URL
  ],
  controllers: [MisRetosGatewayController],
})
export class MisRetosGatewayModule {}
