// src/modules/mi-perfil/dto/change-password.dto.ts

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO used to change the current user's password.
 * It requires the existing password and a new one that meets
 * the minimum security requirements.
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user (for verification)',
    example: 'OldP4ssw0rd',
  })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    description: 'New password to be set for the user',
    example: 'NewStr0ngP4ss!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
