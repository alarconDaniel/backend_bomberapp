// src/db/entities/Rol.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'roles' })
/**
 * Role entity representing a user role in the system.
 * Each role can be associated with multiple users.
 */
export class Rol {
  @PrimaryGeneratedColumn({ name: 'cod_rol', type: 'int' })
  // Unique identifier for the role.
  codRol!: number;

  @Column({ name: 'nombre_rol', type: 'varchar', length: 255 })
  // Human-readable name of the role (e.g. "admin", "operator").
  nombreRol!: string;

  @OneToMany(() => Usuario, (u) => u.rol)
  // Collection of users that have this role assigned.
  usuarios!: Usuario[];
}
