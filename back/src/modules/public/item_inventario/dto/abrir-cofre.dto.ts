// src/modules/public/item_inventario/dto/abrir-cofre.dto.ts
import { IsInt, Min } from 'class-validator';

export class AbrirCofreDto {
  @IsInt()
  @Min(1)
  codItemInventario!: number;
}
