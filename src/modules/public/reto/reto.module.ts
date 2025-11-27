// src/modules/reto/reto.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RetoController } from './reto.controller';
import { RetoService } from './reto.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { RetosCron } from './retos.cron';
import { UsuarioModule } from '../usuario/usuario.module';

/**

* Módulo de retos: expone los endpoints de gestión/consulta
* y registra el cron que asigna y vence retos automáticamente.
  */
  @Module({
  imports: [
  ConexionModule,
  UsuarioModule,
  ],
  controllers: [RetoController],
  providers: [RetoService, RetosCron],
  })
  export class RetoModule {}
