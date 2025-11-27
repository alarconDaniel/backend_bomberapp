import { PartialType } from '@nestjs/swagger';
import { CreatePreguntaDto } from './create-pregunta.dto';

/**
 * DTO para actualizar una pregunta.
 * Hereda todos los campos de CreatePreguntaDto, pero los hace opcionales.
 */
export class UpdatePreguntaDto extends PartialType(CreatePreguntaDto) {}
