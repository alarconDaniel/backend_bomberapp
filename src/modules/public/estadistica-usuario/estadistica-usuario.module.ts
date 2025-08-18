import { Module } from '@nestjs/common';
import { EstadisticaUsuarioController } from './estadistica-usuario.controller';
import { EstadisticaUsuarioService } from './estadistica-usuario.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  controllers: [EstadisticaUsuarioController],
  providers: [EstadisticaUsuarioService]
})
export class EstadisticaUsuarioModule {}
