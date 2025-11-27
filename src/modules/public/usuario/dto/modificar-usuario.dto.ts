import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para modificar datos de un usuario existente.
 * Todos los campos salvo `codUsuario` son opcionales (parche parcial).
 */
export class ModificarUsuarioDto {
  @ApiProperty({
    description: 'Identificador interno del usuario a modificar.',
    example: 42,
  })
  @Type(() => Number)
  @IsInt()
  codUsuario!: number;

  @ApiPropertyOptional({
    description: 'Nuevo nombre del usuario.',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  nombreUsuario?: string;

  @ApiPropertyOptional({
    description: 'Nuevo apellido del usuario.',
    example: 'Pérez',
  })
  @IsOptional()
  @IsString()
  apellidoUsuario?: string;

  @ApiPropertyOptional({
    description: 'Nueva cédula del usuario (se mantiene como string).',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  cedulaUsuario?: string;

  @ApiPropertyOptional({
    description: 'Nuevo nickname visible del usuario.',
    example: 'ElCrack',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  nicknameUsuario?: string | null;

  @ApiPropertyOptional({
    description: 'Nuevo correo electrónico del usuario.',
    example: 'nuevo.correo@empresa.com',
  })
  @IsOptional()
  @IsEmail()
  correoUsuario?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña del usuario. Debe cumplir el mínimo configurado.',
    minLength: 4,
    example: 'Cambiar123',
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  contrasenaUsuario?: string;

  @ApiPropertyOptional({
    description: 'Nuevo rol asignado al usuario (ej. 1=Admin, 2=Operario).',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codRol?: number;

  @ApiPropertyOptional({
    description: 'Nuevo cargo del usuario. Puede ser nulo si no aplica.',
    example: 5,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codCargoUsuario?: number | null;

  @ApiPropertyOptional({
    description: 'Versión del token para forzar logout global (incrementa para invalidar tokens antiguos).',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tokenVersion?: number;
}
