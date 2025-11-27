// src/modules/public/usuario-logro/usuario-logro.module.ts
/**
 * Módulo que expone los endpoints de "mis logros" públicos
 * y provee el servicio para consultar logros por usuario.
 * Usa la conexión genérica de la BD (ConexionModule).
 */
import { Module } from '@nestjs/common';
import { UsuarioLogroController } from './usuario-logro.controller';
import { UsuarioLogroService } from './usuario-logro.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  controllers: [UsuarioLogroController],
  providers: [UsuarioLogroService],
  exports: [UsuarioLogroService],
})
export class UsuarioLogroModule {}
