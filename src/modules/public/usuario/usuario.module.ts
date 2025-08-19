import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  controllers: [UsuarioController],
  providers: [UsuarioService]
})
export class UsuarioModule {}
