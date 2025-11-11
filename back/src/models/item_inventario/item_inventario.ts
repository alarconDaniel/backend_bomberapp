// src/models/items-inventario/item-inventario.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../usuario/usuario';
import { ItemTienda } from '../item-tienda/item-tienda';

@Entity({ name: 'items_inventario' })
export class ItemInventario {
  @PrimaryGeneratedColumn({ name: 'cod_item_inventario' })
  codItemInventario: number;

  // FK -> usuarios.cod_usuario  (parte de la PK compuesta)
  @ManyToOne(() => Usuario, (u) => u.itemsInventario, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  
  })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  usuario: Usuario;

  // FK -> items_tienda.cod_item  (parte de la PK compuesta)
  @ManyToOne(() => ItemTienda, (it) => it.itemsInventario, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })

  @JoinColumn({ name: 'cod_item', referencedColumnName: 'codItem' })
  item: ItemTienda;

  @Column({ name: 'cantidad_item', type: 'int' })
  cantidad: number;

  @Column({
    name: 'fecha_compra_item',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCompra: Date;
}