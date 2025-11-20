// src/modules/preguntas/dto/create-pregunta.dto.ts

import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum TipoPregunta {
  ABCD = "abcd",
  RELLENAR = "rellenar",
  EMPAREJAR = "emparejar",
  REPORTE = "reporte",
}

const TIPO_PREGUNTA_ENUM = [
  "abcd",
  "rellenar",
  "emparejar",
  "reporte",
] as const;

/**
 * DTO used to create a new question for a challenge (reto).
 * It defines the statement, type, scoring and timing information.
 */
export class CreatePreguntaDto {
  @ApiPropertyOptional({
    description:
      "Explicit question order within the challenge. If omitted, the service assigns the next available number.",
    example: 3,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroPregunta?: number; // if not provided, service calculates MAX+1

  @ApiProperty({
    description: "Question statement shown to the user",
    example: "What is the capital of Colombia?",
  })
  @IsString()
  enunciado!: string;

  @ApiProperty({
    description: "Question type",
    enum: TIPO_PREGUNTA_ENUM,
    example: "abcd",
  })
  @IsEnum(TIPO_PREGUNTA_ENUM)
  tipo!: TipoPregunta;

  @ApiProperty({
    description:
      "Score (points) granted when the question is answered correctly",
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  puntos!: number;

  @ApiProperty({
    description: "Maximum time allowed to answer the question, in seconds",
    example: 60,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  tiempoMax!: number;

  @ApiProperty({
    description: "Identifier of the challenge (reto) this question belongs to",
    example: 12,
  })
  @IsInt()
  codReto!: number;
}
