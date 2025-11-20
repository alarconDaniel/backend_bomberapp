// src/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO used to authenticate a user with email and password credentials.
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email used to authenticate',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    minLength: 8,
    example: 'StrongP4ssw0rd',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
