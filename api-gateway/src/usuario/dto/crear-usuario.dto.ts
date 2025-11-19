// src/modules/usuario/dto/crear-usuario.dto.ts
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO used to create a new user.
 *
 * This shape is validated at the gateway layer before
 * forwarding data to downstream services.
 */
export class CrearUsuarioDto {
  @IsString()
  nombreUsuario!: string;

  @IsString()
  apellidoUsuario!: string;

  /**
   * Normalizes the user identifier (cedula) as a string.
   * Accepts numeric or string inputs and preserves null/undefined.
   */
  @Transform(({ value }) =>
    value === null || value === undefined ? value : String(value),
  )
  @IsString()
  cedulaUsuario!: string;

  @IsOptional()
  @IsString()
  nicknameUsuario?: string | null;

  @IsEmail()
  correoUsuario!: string;

  @IsString()
  @MinLength(8)
  contrasenaUsuario!: string;

  @Type(() => Number)
  @IsInt()
  codRol!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codCargoUsuario?: number | null;
}
