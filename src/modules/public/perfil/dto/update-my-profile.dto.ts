import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar el perfil del usuario autenticado.
 */
export class UpdateMyProfileDto {
  @ApiProperty({
    description: 'Nombre real del usuario (no nickname).',
    maxLength: 255,
    example: 'Jane',
  })
  @IsString()
  @MaxLength(255)
  nombreUsuario!: string;

  @ApiProperty({
    description: 'Apellido del usuario.',
    maxLength: 255,
    example: 'Doe',
  })
  @IsString()
  @MaxLength(255)
  apellidoUsuario!: string;

  @ApiProperty({
    description: 'Correo principal de la cuenta; se usa para login y notificaciones.',
    maxLength: 255,
    example: 'jane.doe@gruasyequipos.com',
  })
  @IsEmail()
  @MaxLength(255)
  correoUsuario!: string;

  @ApiProperty({
    description: 'Documento de identificación del usuario en texto.',
    maxLength: 45,
    example: '81932143',
  })
  @IsString()
  @MaxLength(45)
  cedulaUsuario!: string;

  @ApiPropertyOptional({
    description: 'Alias público del usuario en la app; puede omitirse.',
    maxLength: 255,
    example: 'ElAmorDeTuVida',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nicknameUsuario?: string | null;
}
