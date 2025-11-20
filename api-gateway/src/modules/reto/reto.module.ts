import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { RetoController } from './reto.controller';

/**
 * Module that exposes "reto" gateway endpoints and
 * forwards requests to the retos-service.
 */
@Module({
  imports: [
    HttpModule,   // Exposes HttpService for communicating with retos-service
    ConfigModule, // Used to read the RETOS_URL configuration value
  ],
  controllers: [RetoController],
})
export class RetoModule {}
