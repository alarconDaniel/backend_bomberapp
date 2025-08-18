// src/modules/public/usuario/dto/crear-usuario.dto.ts
import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearUsuarioDto {
  @IsString() nombreUsuario!: string;
  @IsString() apellidoUsuario!: string;
  @IsEmail()  correoUsuario!: string;

  // Puede ser null/omitido si es admin
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codCargoUsuario?: number | null;

  @Type(() => Number)
  @IsInt()
  codRol!: number;

  @IsString()
  @MinLength(8)
  password!: string; // la pone el admin
}
