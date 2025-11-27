import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar solo el nickname visible del usuario.
 */
export class UpdateNicknameDto {
  @ApiProperty({
    description: 'Nuevo nickname público del usuario.',
    minLength: 3,
    maxLength: 32,
    example: 'BESTOPiromanaCoctelera',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  nickname!: string;
}
