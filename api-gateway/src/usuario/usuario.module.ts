import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { UsuarioGatewayController } from './usuario.controller';

/**
 * Module that exposes "usuario" gateway endpoints and
 * forwards user-related requests to the identity-service.
 */
@Module({
  imports: [
    HttpModule,   // Provides HttpService for calling identity-service
    ConfigModule, // Provides configuration access (e.g. IDENTITY_URL)
  ],
  controllers: [UsuarioGatewayController],
})
export class UsuarioModule {}
