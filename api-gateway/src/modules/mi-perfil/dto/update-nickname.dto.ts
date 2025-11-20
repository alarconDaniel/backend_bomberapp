// src/modules/mi-perfil/dto/update-nickname.dto.ts

import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO used to update only the nickname of the current user.
 */
export class UpdateNicknameDto {
  @ApiProperty({
    description: 'New nickname to be set for the user',
    example: 'superJuan',
    minLength: 3,
    maxLength: 32,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  nickname!: string;
}
