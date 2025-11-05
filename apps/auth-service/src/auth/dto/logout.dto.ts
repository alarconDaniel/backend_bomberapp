import { IsJWT, IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsJWT()
  refreshToken!: string;
}
