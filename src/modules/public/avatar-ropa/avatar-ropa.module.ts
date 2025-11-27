// src/modules/avatar-ropa/avatar-ropa.module.ts
import { Module } from '@nestjs/common';
import { AvatarRopaController } from './avatar-ropa.controller';
import { AvatarRopaService } from './avatar-ropa.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

/**
 * Módulo de avatar/ropa: expone el controlador
 * y registra el servicio usando la conexión principal a BD.
 */
@Module({
  imports: [ConexionModule],
  controllers: [AvatarRopaController],
  providers: [AvatarRopaService],
  exports: [AvatarRopaService],
})
export class AvatarRopaModule {}
