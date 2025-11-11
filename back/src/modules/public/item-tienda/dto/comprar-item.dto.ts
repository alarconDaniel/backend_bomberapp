// src/modules/item-tienda/dto/comprar-item.dto.ts
import { IsInt, Min } from 'class-validator';

export class ComprarItemDto {
  @IsInt()
  codItem: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}
