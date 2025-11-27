import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para cambio de contraseña del usuario autenticado.
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario, se usa para validar el cambio.',
    example: 'MiPassActual123!',
  })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    description: 'Nueva contraseña, mínimo 8 caracteres.',
    minLength: 8,
    example: 'NuevaPassSegura#2025',
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
