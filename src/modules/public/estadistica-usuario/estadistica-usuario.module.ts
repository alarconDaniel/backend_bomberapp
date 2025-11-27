// src/modules/estadistica-usuario/estadistica-usuario.module.ts
import { Module } from '@nestjs/common';
import { EstadisticaUsuarioController } from './estadistica-usuario.controller';
import { EstadisticaUsuarioService } from './estadistica-usuario.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RachaCron } from './racha.cron';

/**
 * Módulo de estadísticas de usuario: expone los endpoints
 * y orquesta el servicio + cron de manejo de rachas.
 */
@Module({
  imports: [ConexionModule],
  controllers: [EstadisticaUsuarioController],
  providers: [EstadisticaUsuarioService, RachaCron],
  exports: [EstadisticaUsuarioService],
})
export class EstadisticaUsuarioModule {}
