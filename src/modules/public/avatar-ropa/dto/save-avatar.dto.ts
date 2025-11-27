// src/modules/avatar-ropa/dto/save-avatar.dto.ts
import { IsObject, IsOptional, IsInt, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Slot } from 'src/common/slots.enum'; // Enum de slots disponible en el dominio (no se usa directo aquí, pero da contexto)

/**
 * Representa los items equipados en cada slot de ropa del avatar.
 * Cada propiedad apunta al cod_item_inventario (o similar) que está equipado en ese slot.
 */
export class SlotsPayload {
  @ApiPropertyOptional({
    description: 'Item equipado en el slot de cabeza (ID de inventario).',
    type: 'integer',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  @Type(() => Number)
  @IsInt()
  cabeza?: number;

  @ApiPropertyOptional({
    description: 'Item equipado en el slot de torso (ID de inventario).',
    type: 'integer',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  @Type(() => Number)
  @IsInt()
  torso?: number;

  @ApiPropertyOptional({
    description: 'Item equipado en el slot de piernas (ID de inventario).',
    type: 'integer',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  @Type(() => Number)
  @IsInt()
  piernas?: number;

  @ApiPropertyOptional({
    description: 'Item equipado en el slot de pies (ID de inventario).',
    type: 'integer',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  @Type(() => Number)
  @IsInt()
  pies?: number;

  @ApiPropertyOptional({
    description: 'Item equipado en el slot extra (ID de inventario).',
    type: 'integer',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  @Type(() => Number)
  @IsInt()
  extra?: number;
}

/**
 * DTO principal para guardar la configuración de avatar de un usuario.
 * El backend espera un objeto con los slots y los IDs de los items equipados.
 */
export class SaveAvatarDto {
  @ApiProperty({
    description:
      'Objeto con los items equipados por slot del avatar. ' +
      'Las claves son los slots (cabeza, torso, piernas, pies, extra) y los valores los IDs de inventario.',
    type: () => SlotsPayload,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => SlotsPayload)
  slots!: SlotsPayload;
}
