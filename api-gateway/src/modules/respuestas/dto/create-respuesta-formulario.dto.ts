// src/modules/respuestas/dto/create-respuesta-formulario.dto.ts

import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO used to create a form response associated with
 * a user-challenge assignment and a specific challenge.
 */
export class CreateRespuestaFormularioDto {
  @ApiProperty({
    description:
      'Identifier of the user-challenge assignment (usuario-reto) associated with this form response',
    example: 123,
  })
  @IsInt()
  codUsuarioReto!: number;

  @ApiProperty({
    description: 'Identifier of the challenge (reto) the form belongs to',
    example: 45,
  })
  @IsInt()
  codReto!: number;

  @ApiProperty({
    description:
      'Arbitrary form payload submitted by the user. The structure depends on the form schema defined for the challenge.',
    example: {
      pregunta1: 'Sí',
      observaciones: 'Todo funcionando correctamente',
    },
  })
  // Intentionally left without validation decorators to allow flexible shapes
  data!: any;

  @ApiPropertyOptional({
    description:
      'Optional completion timestamp for the form response. If omitted, the backend may set it automatically.',
    example: '2025-01-15T13:45:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  terminadoEn?: Date | null;
}
