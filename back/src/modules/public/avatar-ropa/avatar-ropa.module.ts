// src/modules/avatar-ropa/avatar-ropa.module.ts
import { Module } from '@nestjs/common';
import { AvatarRopaController } from './avatar-ropa.controller';
import { AvatarRopaService } from './avatar-ropa.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  controllers: [AvatarRopaController],
  providers: [AvatarRopaService],
  exports: [AvatarRopaService],
})
export class AvatarRopaModule {}
