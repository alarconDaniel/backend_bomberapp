import { Pregunta } from './../../../models/pregunta/pregunta';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreguntasService } from './preguntas.service';
import { PreguntasController } from './preguntas.controller';

/**
 * Módulo de gestión de preguntas de los retos:
 * expone CRUD y orden de preguntas sobre la entidad Pregunta.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Pregunta])],
  controllers: [PreguntasController],
  providers: [PreguntasService],
  exports: [PreguntasService],
})
export class PreguntasModule {}
