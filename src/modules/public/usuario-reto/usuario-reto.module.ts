// src/modules/public/usuario-reto/usuario-reto.module.ts

/**
 * Módulo que agrupa la lógica de los retos asignados al usuario (“mis retos”):
 * - Orquesta el servicio de UsuarioReto.
 * - Expone el controlador con los endpoints para que el operario vea y gestione sus retos.
 * - Depende del módulo de conexión a la base de datos.
 */
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
