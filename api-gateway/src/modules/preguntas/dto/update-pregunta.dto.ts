// src/modules/preguntas/dto/update-pregunta.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreatePreguntaDto } from './create-pregunta.dto';

/**
 * DTO used to partially update an existing question.
 * All properties are optional; only provided fields will be updated.
 */
export class UpdatePreguntaDto extends PartialType(CreatePreguntaDto) {}
