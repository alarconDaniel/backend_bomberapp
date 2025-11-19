// src/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO used to authenticate a user with email and password credentials.
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
