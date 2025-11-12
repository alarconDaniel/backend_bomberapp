import { Module } from '@nestjs/common';
import { RetoGatewayController } from './reto.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
    HttpModule,      // 👈 aquí nace HttpService
  ],
  controllers: [RetoGatewayController]
})
export class RetoModule {}
