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
// Representa una unidad de ítem en el inventario de un usuario
export class ItemInventario {
  // Identificador único del registro de inventario
  @PrimaryGeneratedColumn({ name: 'cod_item_inventario' })
  codItemInventario: number;

  // FK -> usuarios.cod_usuario
  // Usuario dueño de este ítem en el inventario
  @ManyToOne(() => Usuario, (u) => u.itemsInventario, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  usuario: Usuario;

  // FK -> items_tienda.cod_item
  // Referencia al ítem de la tienda del que proviene este registro
  @ManyToOne(() => ItemTienda, (it) => it.itemsInventario, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cod_item', referencedColumnName: 'codItem' })
  item: ItemTienda;

  // Cantidad de unidades de este ítem que posee el usuario
  @Column({ name: 'cantidad_item', type: 'int' })
  cantidad: number;

  // Momento en el que se adquirió este ítem (o se creó el registro)
  @Column({
    name: 'fecha_compra_item',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCompra: Date;
}
