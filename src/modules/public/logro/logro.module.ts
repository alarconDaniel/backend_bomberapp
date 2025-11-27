import { Module } from '@nestjs/common';
import { LogroController } from './logro.controller';
import { LogroService } from './logro.service';

/**
 * Módulo que agrupa la API y la lógica de negocio de los logros.
 * Registra el controlador y el servicio para gestionar logros de usuarios.
 */
@Module({
  controllers: [LogroController],
  providers: [LogroService],
})
export class LogroModule {}
