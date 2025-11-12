import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ModificarUsuarioDto {
  @Type(() => Number) @IsInt()
  codUsuario!: number;

  @IsOptional() @IsString()
  nombreUsuario?: string;

  @IsOptional() @IsString()
  apellidoUsuario?: string;

  @IsOptional() @IsString()
  cedulaUsuario?: string;

  @IsOptional() @IsString()
  nicknameUsuario?: string | null;

  @IsOptional() @IsEmail()
  correoUsuario?: string;

  @IsOptional() @IsString() @MinLength(4)
  contrasenaUsuario?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  codRol?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  codCargoUsuario?: number | null;

  // por si decides exponerlo; tu service ya lo maneja
  @IsOptional() @Type(() => Number) @IsInt()
  tokenVersion?: number;
}
