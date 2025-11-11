import { Module } from '@nestjs/common';
import { EstadisticaUsuarioController } from './estadistica-usuario.controller';
import { EstadisticaUsuarioService } from './estadistica-usuario.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RachaCron } from './racha.cron';

@Module({
  imports: [ConexionModule],
  controllers: [EstadisticaUsuarioController],
  providers: [EstadisticaUsuarioService, RachaCron],
  exports: [EstadisticaUsuarioService]
})
export class EstadisticaUsuarioModule {}
