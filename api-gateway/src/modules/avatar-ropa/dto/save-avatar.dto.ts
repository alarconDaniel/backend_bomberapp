import {
  IsInt,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


/**
 * Payload that represents the set of clothing items
 * equipped on each avatar slot (head, torso, legs, feet, extra).
 *
 * Each property stores the identifier of an owned clothing item,
 * or is omitted when the slot is empty.
 */
export class SlotsPayload {
  @ApiPropertyOptional({
    description:
      'Identifier of the clothing item equipped on the head slot (cabeza)',
    example: 101,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : value,
  )
  @Type(() => Number)
  @IsInt()
  cabeza?: number;

  @ApiPropertyOptional({
    description:
      'Identifier of the clothing item equipped on the torso slot (torso)',
    example: 202,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : value,
  )
  @Type(() => Number)
  @IsInt()
  torso?: number;

  @ApiPropertyOptional({
    description:
      'Identifier of the clothing item equipped on the legs slot (piernas)',
    example: 303,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : value,
  )
  @Type(() => Number)
  @IsInt()
  piernas?: number;

  @ApiPropertyOptional({
    description:
      'Identifier of the clothing item equipped on the feet slot (pies)',
    example: 404,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : value,
  )
  @Type(() => Number)
  @IsInt()
  pies?: number;

  @ApiPropertyOptional({
    description:
      'Identifier of an additional clothing item equipped on the extra slot',
    example: 505,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : value,
  )
  @Type(() => Number)
  @IsInt()
  extra?: number;
}

/**
 * DTO used to persist the avatar's equipped clothing configuration.
 * It encapsulates the mapping of each slot to a clothing item identifier.
 */
export class SaveAvatarDto {
  @ApiProperty({
    description:
      'Map of avatar equipment slots and the clothing item identifiers equipped in each one',
    type: () => SlotsPayload,
    example: {
      cabeza: 101,
      torso: 202,
      piernas: 303,
      pies: 404,
      extra: null,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => SlotsPayload)
  slots!: SlotsPayload;
}
