// src/modules/public/usuario-reto/usuario-reto.module.ts
import { Module } from '@nestjs/common';
import { UsuarioRetoService } from './usuario-reto.service';
import { UsuarioRetoController } from './usuario-reto.controller';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  providers: [UsuarioRetoService],
  controllers: [UsuarioRetoController],
  exports: [UsuarioRetoService],
})
export class UsuarioRetoModule {}
