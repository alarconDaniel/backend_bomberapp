import { RespuestaPreguntaUsuario } from './../../../models/respuesta/RespuestaPreguntaUsuario';
import { RespuestaFormularioUsuario } from './../../../models/respuesta/RespuestaFormularioUsuario';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RespuestasService } from './respuestas.service';
import { RespuestasController } from './respuestas.controller';

/**
 * Módulo de gestión de respuestas (quiz y formularios).
 * Expone el controller público y el servicio sobre las entidades de respuestas.
 */
@Module({
  imports: [TypeOrmModule.forFeature([RespuestaPreguntaUsuario, RespuestaFormularioUsuario])],
  controllers: [RespuestasController],
  providers: [RespuestasService],
  exports: [RespuestasService],
})
export class RespuestasModule {}
