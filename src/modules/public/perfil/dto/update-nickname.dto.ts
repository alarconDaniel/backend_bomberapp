import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateNicknameDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  nickname!: string;
}
