// src/db/entities/Rol.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'roles' })
export class Rol {
  @PrimaryGeneratedColumn({ name: 'cod_rol', type: 'int' })
  codRol!: number;

  @Column({ name: 'nombre_rol', type: 'varchar', length: 255 })
  nombreRol!: string;

  @OneToMany(() => Usuario, (u) => u.rol)
  usuarios!: Usuario[];
}
