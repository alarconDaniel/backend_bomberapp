import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO used to modify an existing user.
 *
 * All properties are optional except the identifier `codUsuario`.
 * Only provided fields will be considered for update.
 */
export class ModificarUsuarioDto {
  @Type(() => Number)
  @IsInt()
  codUsuario!: number;

  @IsOptional()
  @IsString()
  nombreUsuario?: string;

  @IsOptional()
  @IsString()
  apellidoUsuario?: string;

  @IsOptional()
  @IsString()
  cedulaUsuario?: string;

  @IsOptional()
  @IsString()
  nicknameUsuario?: string | null;

  @IsOptional()
  @IsEmail()
  correoUsuario?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  contrasenaUsuario?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codRol?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codCargoUsuario?: number | null;

  /**
   * Version indicator for the refresh token associated with the user.
   * This is optional and only relevant if the API chooses to expose it.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tokenVersion?: number;
}
