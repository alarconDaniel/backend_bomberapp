import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Payload para crear/guardar una respuesta de formulario
 * asociada a un reto asignado a un usuario.
 */
export class CreateRespuestaFormularioDto {
  @ApiProperty({
    description: 'Identificador de la relación usuario-reto (tabla usuarios_retos).',
    example: 12,
  })
  @IsInt()
  codUsuarioReto!: number;

  @ApiProperty({
    description: 'Identificador del reto al que pertenece el formulario.',
    example: 3,
  })
  @IsInt()
  codReto!: number;

  @ApiProperty({
    description: 'Contenido del formulario en formato JSON (respuestas del usuario).',
    type: Object,
    example: {
      pregunta1: 'Respuesta abierta',
      pregunta2: 5,
      pregunta3: ['opcionA', 'opcionC'],
    },
  })
  data!: any;

  @ApiPropertyOptional({
    description: 'Fecha/hora en que el usuario terminó el formulario (si aplica).',
    type: String,
    format: 'date-time',
    example: '2025-01-15T14:30:00Z',
  })
  @IsOptional()
  terminadoEn?: Date | null;
}
