// auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO para las credenciales de inicio de sesión
export class LoginDto {
  // Correo del usuario que intenta autenticarse
  @ApiProperty({
    description: 'Correo electrónico registrado del usuario',
    example: 'ellen.joe@gruasyequipos.com',
  })
  @IsEmail()
  email: string;

  // Contraseña en texto plano (se validará y luego se comparará en el servicio)
  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    minLength: 8,
    example: 'sl33pyshark',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
