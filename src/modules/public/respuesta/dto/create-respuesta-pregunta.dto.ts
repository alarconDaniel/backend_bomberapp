import { IsInt, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para registrar la respuesta de un usuario a una pregunta de un reto.
 */
export class CreateRespuestaPreguntaDto {
  @ApiProperty({
    description: 'Identificador de la relación usuario-reto (usuarios_retos.cod_usuario_reto).',
    example: 10,
  })
  @IsInt()
  codUsuarioReto!: number;

  @ApiProperty({
    description: 'Identificador de la pregunta respondida (preguntas.cod_pregunta).',
    example: 42,
  })
  @IsInt()
  codPregunta!: number;

  @ApiPropertyOptional({
    description: 'Valor de la respuesta en JSON (según tipo de pregunta: opción, texto, pares, etc.).',
    type: Object,
    example: { opcionSeleccionada: 'A' },
  })
  @IsOptional()
  valorJson?: any;

  @ApiPropertyOptional({
    description: 'Indica si la respuesta fue correcta (para preguntas calificables automáticamente).',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  esCorrecta?: boolean;

  @ApiPropertyOptional({
    description: 'Puntaje obtenido en esta respuesta.',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  puntaje?: number;

  @ApiPropertyOptional({
    description: 'Tiempo que tardó el usuario en responder, en segundos.',
    example: 18,
  })
  @IsOptional()
  @IsInt()
  tiempoSeg?: number;
}
