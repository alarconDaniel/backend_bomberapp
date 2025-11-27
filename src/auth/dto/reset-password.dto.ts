// // src/auth/dto/reset-password.dto.ts
// import { IsString, MinLength } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// // DTO para realizar el cambio de contraseña usando un token de recuperación
// export class ResetPasswordDto {
//   // Token recibido por correo (o canal definido) para validar la operación
//   @ApiProperty({
//     description: 'Token de recuperación de contraseña enviado al usuario',
//     example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
//   })
//   @IsString()
//   token!: string;

//   // Nueva contraseña que reemplazará la anterior (mínimo 8 caracteres)
//   @ApiProperty({
//     description: 'Nueva contraseña que se asignará al usuario',
//     minLength: 8,
//     example: 'NuevaClaveSegura123',
//   })
//   @IsString()
//   @MinLength(8)
//   newPassword!: string;
// }
