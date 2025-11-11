// src/modules/avatar-ropa/dto/save-avatar.dto.ts
import { IsObject, IsOptional, IsInt, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Slot } from 'src/common/slots.enum';

export class SlotsPayload {
  @IsOptional() @Transform(({value}) => value === null ? undefined : value) @Type(() => Number) @IsInt()
  cabeza?: number;

  @IsOptional() @Transform(({value}) => value === null ? undefined : value) @Type(() => Number) @IsInt()
  torso?: number;

  @IsOptional() @Transform(({value}) => value === null ? undefined : value) @Type(() => Number) @IsInt()
  piernas?: number;

  @IsOptional() @Transform(({value}) => value === null ? undefined : value) @Type(() => Number) @IsInt()
  pies?: number;

  @IsOptional() @Transform(({value}) => value === null ? undefined : value) @Type(() => Number) @IsInt()
  extra?: number;
}

export class SaveAvatarDto {
  @IsObject()
  @ValidateNested()
  @Type(() => SlotsPayload)
  slots!: SlotsPayload;
}
