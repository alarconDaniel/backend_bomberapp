// // src/auth/dto/forgot-password.dto.ts
// import { IsEmail } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// // DTO para solicitar el envío de correo de recuperación de contraseña
// export class ForgotPasswordDto {
//   // Correo del usuario al que se enviará el enlace/código de recuperación
//   @ApiProperty({
//     description: 'Correo del usuario que solicita recuperar su contraseña',
//     example: 'usuario@dominio.com',
//   })
//   @IsEmail()
//   email!: string;
// }
