import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

/**
 * Módulo de usuario:
 * - Expone los endpoints de gestión de usuarios.
 * - Reexporta UsuarioService para que otros módulos puedan inyectarlo.
 */
@Module({
  imports: [ConexionModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
