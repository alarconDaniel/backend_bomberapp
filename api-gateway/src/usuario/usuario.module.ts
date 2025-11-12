import { Module } from '@nestjs/common';
import { UsuarioGatewayController } from './usuario.controller';

@Module({
  controllers: [UsuarioGatewayController]
})
export class UsuarioModule {}
