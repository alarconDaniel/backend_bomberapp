// src/modules/usuario/dto/crear-usuario.dto.ts
import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CrearUsuarioDto {
  @IsString() nombreUsuario!: string;
  @IsString() apellidoUsuario!: string;

  // 🔽 convierte lo que venga (número o string) a string
  @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
  @IsString()
  cedulaUsuario!: string;

  @IsOptional() @IsString()
  nicknameUsuario?: string | null;

  @IsEmail() correoUsuario!: string;
  @IsString() @MinLength(8) contrasenaUsuario!: string;

  @Type(() => Number) @IsInt() codRol!: number;
  @IsOptional() @Type(() => Number) @IsInt()
  codCargoUsuario?: number | null;
}
