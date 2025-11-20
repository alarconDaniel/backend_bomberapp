// src/modules/mi-perfil/dto/update-my-profile.dto.ts

import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO used to update the basic profile data of the current user.
 * It covers first name, last name, email, ID number and optional nickname.
 */
export class UpdateMyProfileDto {
  @ApiProperty({
    description: 'User first name',
    example: 'Juan',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  nombreUsuario!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Pérez',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  apellidoUsuario!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'juan.perez@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  correoUsuario!: string;

  @ApiProperty({
    description: 'User identification number',
    example: '123456789',
    maxLength: 45,
  })
  @IsString()
  @MaxLength(45)
  cedulaUsuario!: string;

  @ApiPropertyOptional({
    description: 'Optional nickname for the user profile',
    example: 'juampi',
    nullable: true,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nicknameUsuario?: string | null;
}
