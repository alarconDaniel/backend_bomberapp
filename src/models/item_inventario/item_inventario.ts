// src/models/items-inventario/item-inventario.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'items_inventario' })
export class ItemInventario {
  @PrimaryGeneratedColumn({ name: 'cod_item_inventario' })
  codItemInventario: number;

  @Column({ name: 'cod_usuario', type: 'int' })
  codUsuario: number;

  @Column({ name: 'cod_item', type: 'int' })
  codItem: number;

  @Column({ name: 'cantidad_item', type: 'int' })
  cantidad: number;

  @Column({ name: 'fecha_compra_item', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaCompra: Date;
}
