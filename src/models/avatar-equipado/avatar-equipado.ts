// src/models/avatar-equipado/avatar-equipado.ts
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../usuario/usuario';
import { ItemInventario } from '../item_inventario/item_inventario';
import { Slot } from 'src/common/slots.enum';

@Entity('avatar_equipado')
// Representa qué ítems visuales tiene equipado un usuario en cada slot del avatar
export class AvatarEquipado {
  @PrimaryGeneratedColumn({ name: 'cod_avatar_equipado', type: 'int' })
  codAvatarEquipado!: number;

  // Usuario dueño del avatar (un usuario puede tener varias filas: una por slot)
  @Column({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  // Slot del avatar al que aplica este ítem (cabeza, torso, piernas, etc.)
  @Column({ name: 'slot', type: 'enum', enum: Slot })
  slot!: Slot;

  // NOT NULL en tu DDL: para “vaciar” el slot se elimina la fila
  // Apunta al ítem concreto del inventario que se está equipando
  @Column({ name: 'cod_item_inventario', type: 'int' })
  codItemInventario!: number;

  // Última vez que se actualizó el equipamiento de este slot
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;

  // Relación al usuario dueño del avatar
  @ManyToOne(() => Usuario, (u) => u.codUsuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  usuario?: Usuario;

  // Relación al ítem de inventario equipado en este slot
  @ManyToOne(() => ItemInventario, (ii) => ii.codItemInventario, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'cod_item_inventario',
    referencedColumnName: 'codItemInventario',
  })
  itemInventario?: ItemInventario;
}
