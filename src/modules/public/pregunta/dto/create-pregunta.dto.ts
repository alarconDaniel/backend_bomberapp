import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPregunta } from './../../../../models/pregunta/pregunta';

export class CreatePreguntaDto {
  @ApiPropertyOptional({
    description: 'Posición/orden de la pregunta dentro del reto. Si no se envía, el backend calcula MAX+1.',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroPregunta?: number; // si no llega, el service calcula MAX+1

  @ApiProperty({
    description: 'Enunciado completo de la pregunta que verá la persona usuaria.',
    example: '¿Cuál es el procedimiento correcto antes de operar la grúa?',
  })
  @IsString()
  enunciado!: string;

  @ApiProperty({
    description: 'Tipo de pregunta según el modelo: abcd, rellenar, emparejar o reporte.',
    enum: TipoPregunta,
    example: TipoPregunta.ABCD,
  })
  @IsEnum(TipoPregunta)
  tipo!: TipoPregunta;

  @ApiProperty({
    description: 'Puntos que otorga la pregunta al contestarse correctamente.',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  puntos!: number;

  @ApiProperty({
    description: 'Tiempo máximo para responder la pregunta, en segundos.',
    example: 60,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  tiempoMax!: number;

  @ApiProperty({
    description: 'Identificador del reto al que pertenece la pregunta.',
    example: 12,
  })
  @IsInt()
  codReto!: number;
}
