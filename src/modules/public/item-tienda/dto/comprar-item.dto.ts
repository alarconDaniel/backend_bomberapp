// src/modules/item-tienda/dto/comprar-item.dto.ts
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitar la compra de un ítem de la tienda.
 * Se valida que exista un ítem y que la cantidad sea al menos 1.
 */
export class ComprarItemDto {
  /** Código del ítem en la tabla items_tienda.cod_item */
  @ApiProperty({
    description: 'Código del ítem en la tabla items_tienda (cod_item).',
    example: 101,
  })
  @IsInt()
  codItem: number;

  /** Cantidad de unidades a comprar (mínimo 1) */
  @ApiProperty({
    description: 'Cantidad de unidades a comprar. Debe ser un entero mayor o igual a 1.',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  cantidad: number;
}
