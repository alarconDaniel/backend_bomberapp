// src/modules/public/item_inventario/dto/abrir-cofre.dto.ts

import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO used to request opening a chest item from the inventory.
 * It identifies which inventory record (chest) should be consumed.
 */
export class AbrirCofreDto {
  @ApiProperty({
    description: 'Inventory item identifier of the chest to open',
    example: 123,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  codItemInventario!: number;
}
