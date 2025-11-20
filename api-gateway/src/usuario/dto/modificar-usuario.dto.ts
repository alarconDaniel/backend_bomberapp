// src/modules/usuario/dto/modificar-usuario.dto.ts
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO used to modify an existing user.
 * All fields except `codUsuario` are optional and will only be updated if provided.
 */
export class ModificarUsuarioDto {
  @ApiProperty({
    description: 'User identifier to be updated',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  codUsuario!: number;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  nombreUsuario?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Pérez',
  })
  @IsOptional()
  @IsString()
  apellidoUsuario?: string;

  @ApiPropertyOptional({
    description: 'User identification number',
    example: '12345678',
  })
  @IsOptional()
  @IsString()
  cedulaUsuario?: string;

  @ApiPropertyOptional({
    description: 'Optional nickname for the user',
    example: 'juampi',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  nicknameUsuario?: string | null;

  @ApiPropertyOptional({
    description: 'User email',
    example: 'juan.perez@example.com',
  })
  @IsOptional()
  @IsEmail()
  correoUsuario?: string;

  @ApiPropertyOptional({
    description: 'New password to set for the user',
    minLength: 4,
    example: 'N3wPass!',
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  contrasenaUsuario?: string;

  @ApiPropertyOptional({
    description: 'Role identifier to assign to the user',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codRol?: number;

  @ApiPropertyOptional({
    description: 'Job position identifier associated with the user',
    example: 5,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codCargoUsuario?: number | null;

  @ApiPropertyOptional({
    description:
      'Token version used to invalidate existing refresh tokens when changed',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tokenVersion?: number;
}
