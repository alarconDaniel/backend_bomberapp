import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMyProfileDto {
  @IsString()
  @MaxLength(255)
  nombreUsuario!: string;

  @IsString()
  @MaxLength(255)
  apellidoUsuario!: string;

  @IsEmail()
  @MaxLength(255)
  correoUsuario!: string;

  @IsString()
  @MaxLength(45)
  cedulaUsuario!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nicknameUsuario?: string | null;
}
