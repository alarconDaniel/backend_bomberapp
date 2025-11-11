import { Module } from '@nestjs/common';
import { TrofeoController } from './trofeo.controller';
import { TrofeoService } from './trofeo.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Trofeo } from 'src/models/trofeo/trofeo';
import { Usuario } from 'src/models/usuario/usuario';
import { AuditoriaTrofeo } from 'src/models/auditoria-trofeo/auditoria-trofeo';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';
import { TrofeoCron } from './trofeo.cron';
import { UsuarioModule } from '../usuario/usuario.module';
import { EstadisticaUsuarioModule } from '../estadistica-usuario/estadistica-usuario.module';

@Module({
  imports:[ConexionModule, UsuarioModule, AuditoriaTrofeo, EstadisticaUsuarioModule 
  ],
  controllers: [TrofeoController],
  providers: [TrofeoService, TrofeoCron],
})
export class TrofeoModule {}
