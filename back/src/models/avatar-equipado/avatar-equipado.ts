// src/models/avatar-equipado/avatar-equipado.ts
import {
  Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { Usuario } from '../usuario/usuario';
import { ItemInventario } from '../item_inventario/item_inventario';
import { Slot } from 'src/common/slots.enum';

@Entity('avatar_equipado')
export class AvatarEquipado {
  @PrimaryGeneratedColumn({ name: 'cod_avatar_equipado', type: 'int' })
  codAvatarEquipado!: number;

  // 👇 columnas que faltaban y que SÍ usas en queries
  @Column({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  @Column({ name: 'slot', type: 'enum', enum: Slot })
  slot!: Slot;

  // NOT NULL en tu DDL: para “vaciar” slot hacemos DELETE de la fila
  @Column({ name: 'cod_item_inventario', type: 'int' })
  codItemInventario!: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;

  @ManyToOne(() => Usuario, (u) => u.codUsuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  usuario?: Usuario;

  @ManyToOne(() => ItemInventario, (ii) => ii.codItemInventario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cod_item_inventario', referencedColumnName: 'codItemInventario' })
  itemInventario?: ItemInventario;
}
