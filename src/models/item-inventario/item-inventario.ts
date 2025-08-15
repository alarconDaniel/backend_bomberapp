import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'items_inventario' })
export class ItemInventario {
  @PrimaryGeneratedColumn({ name: 'cod_item_inventario', type: 'int' })
  cod_item_inventario: number;

  @Column({ name: 'cod_usuario', type: 'int' })
  cod_usuario: number;

  @Column({ name: 'cod_item', type: 'int' })
  cod_item: number;

  @Column({ name: 'cantidad_item', type: 'int' })
  cantidad_item: number;

  @Column({
    name: 'fecha_compra_item',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fecha_compra_item: Date;
}
