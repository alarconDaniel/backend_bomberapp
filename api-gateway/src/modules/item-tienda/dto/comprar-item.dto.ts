// src/modules/public/item-tienda/dto/comprar-item.dto.ts

import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO used to purchase an item from the shop.
 * It specifies which item to buy and how many units to acquire.
 */
export class ComprarItemDto {
  @ApiProperty({
    description: 'Shop item identifier to be purchased',
    example: 42,
  })
  @IsInt()
  codItem: number;

  @ApiProperty({
    description: 'Quantity of the item to purchase (must be at least 1)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  cantidad: number;
}
