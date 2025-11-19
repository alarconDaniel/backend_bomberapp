// src/auth/dto/refresh-token.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO used to request a new access token using a previously issued refresh token.
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token previously issued by the authentication service',
  })
  @IsString()
  refresh_token!: string;
}
