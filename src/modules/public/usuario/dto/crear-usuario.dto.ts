// src/modules/public/usuario/dto/crear-usuario.dto.ts
import { IsEmail, IsInt, IsString, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  @IsString() nombreUsuario!: string;
  @IsString() apellidoUsuario!: string;
  @IsEmail()  correoUsuario!: string;
  @IsString() cargoUsuario!: string;
  @IsInt()    codRol!: number;

  // la pone el admin
  @IsString()
  @MinLength(8)
  password!: string;
}
