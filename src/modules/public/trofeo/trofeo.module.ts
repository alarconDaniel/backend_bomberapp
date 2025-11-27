import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrofeoController } from './trofeo.controller';
import { TrofeoService } from './trofeo.service';
import { TrofeoCron } from './trofeo.cron';

import { ConexionModule } from 'src/config/conexion/conexion.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { EstadisticaUsuarioModule } from '../estadistica-usuario/estadistica-usuario.module';

import { Trofeo } from 'src/models/trofeo/trofeo';
import { Usuario } from 'src/models/usuario/usuario';
import { AuditoriaTrofeo } from 'src/models/auditoria-trofeo/auditoria-trofeo';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';

/**
 * Módulo de trofeos:
 * - Endpoints para recomputar trofeos.
 * - Cron diario para reasignar según reglas.
 * - Repos necesarios para las reglas y auditoría.
 */
@Module({
  imports: [
    ConexionModule,
    UsuarioModule,
    EstadisticaUsuarioModule,
    TypeOrmModule.forFeature([Trofeo, Usuario, AuditoriaTrofeo, EstadisticaUsuario]),
  ],
  controllers: [TrofeoController],
  providers: [TrofeoService, TrofeoCron],
  exports: [TrofeoService],
})
export class TrofeoModule {}
