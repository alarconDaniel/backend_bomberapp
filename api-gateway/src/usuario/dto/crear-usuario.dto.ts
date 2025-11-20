// src/modules/usuario/dto/crear-usuario.dto.ts
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO used to create a new user.
 * Validates and normalizes incoming data at the service boundary.
 */
export class CrearUsuarioDto {
  @ApiProperty({
    description: 'User first name',
    example: 'Juan',
  })
  @IsString()
  nombreUsuario!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Pérez',
  })
  @IsString()
  apellidoUsuario!: string;

  /**
   * Normalizes the user identifier (cedula) as a string.
   * Accepts numeric or string inputs and preserves null/undefined values.
   */
  @ApiProperty({
    description: 'User identification number',
    example: '12345678',
  })
  @Transform(({ value }) =>
    value === null || value === undefined ? value : String(value),
  )
  @IsString()
  cedulaUsuario!: string;

  @ApiPropertyOptional({
    description: 'Optional nickname for the user',
    example: 'juampi',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  nicknameUsuario?: string | null;

  @ApiProperty({
    description: 'User email, must be unique',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  correoUsuario!: string;

  @ApiProperty({
    description: 'User password (stored hashed)',
    minLength: 8,
    example: 'StrongP4ssw0rd',
  })
  @IsString()
  @MinLength(8)
  contrasenaUsuario!: string;

  @ApiProperty({
    description: 'Role identifier assigned to the user',
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  codRol!: number;

  @ApiPropertyOptional({
    description: 'Job position identifier associated with the user',
    example: 5,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codCargoUsuario?: number | null;
}
