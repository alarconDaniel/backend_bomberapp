// src/modules/respuestas/dto/create-respuesta-pregunta.dto.ts

import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO used to store an answer to a single question
 * within a user-challenge assignment.
 */
export class CreateRespuestaPreguntaDto {
  @ApiProperty({
    description:
      'Identifier of the user-challenge assignment (usuario-reto) related to this question answer',
    example: 123,
  })
  @IsInt()
  codUsuarioReto!: number;

  @ApiProperty({
    description: 'Identifier of the question being answered',
    example: 987,
  })
  @IsInt()
  codPregunta!: number;

  @ApiPropertyOptional({
    description:
      'Raw value of the answer in JSON-compatible format (option selected, text, pairs, etc.)',
    example: { opcion: 'A' },
    nullable: true,
  })
  @IsOptional()
  // Flexible JSON payload, no strict validation
  valorJson?: any;

  @ApiPropertyOptional({
    description:
      'Flag indicating whether the answer was evaluated as correct',
    example: true,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  esCorrecta?: boolean;

  @ApiPropertyOptional({
    description:
      'Score obtained with this answer, if applicable',
    example: 10,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  puntaje?: number;

  @ApiPropertyOptional({
    description:
      'Time spent answering this question, in seconds',
    example: 25,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  tiempoSeg?: number;
}
