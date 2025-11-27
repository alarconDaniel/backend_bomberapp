// src/modules/public/usuario/dto/crear-usuario.dto.ts
import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear un usuario desde panel/admin o flujo público.
 * Normaliza cédula a string y permite rol/cargo numéricos.
 */
export class CrearUsuarioDto {
  @ApiProperty({
    description: 'Nombre del usuario.',
    example: 'Juan',
  })
  @IsString()
  nombreUsuario!: string;

  @ApiProperty({
    description: 'Apellido del usuario.',
    example: 'Pérez',
  })
  @IsString()
  apellidoUsuario!: string;

  @ApiProperty({
    description: 'Documento de identidad del usuario (se almacena como string).',
    example: '1234567890',
  })
  // convierte lo que venga (número o string) a string antes de validar
  @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
  @IsString()
  cedulaUsuario!: string;

  @ApiPropertyOptional({
    description: 'Apodo o nickname visible en la app.',
    example: 'ElCrack',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  nicknameUsuario?: string | null;

  @ApiProperty({
    description: 'Correo electrónico del usuario (único en el sistema).',
    example: 'juan.perez@empresa.com',
  })
  @IsEmail()
  correoUsuario!: string;

  @ApiProperty({
    description: 'Contraseña del usuario. Mínimo 8 caracteres.',
    minLength: 8,
    example: 'SuperSegura123',
  })
  @IsString()
  @MinLength(8)
  contrasenaUsuario!: string;

  @ApiProperty({
    description: 'Código del rol asignado al usuario (ej. 1=Admin, 2=Operario).',
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  codRol!: number;

  @ApiPropertyOptional({
    description: 'Código de cargo asociado al usuario, si aplica.',
    example: 5,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codCargoUsuario?: number | null;
}
