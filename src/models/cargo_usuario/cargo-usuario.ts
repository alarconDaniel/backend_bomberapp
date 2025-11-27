// src/models/cargo-usuario/CargoUsuario.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'cargos_usuarios' })
// Catálogo de cargos/roles internos de la organización (no confundir con rol de auth)
export class CargoUsuario {
  @PrimaryGeneratedColumn({ name: 'cod_cargo_usuario', type: 'int' })
  codCargoUsuario!: number;

  // Nombre legible del cargo 
  @Column({ name: 'nombre_cargo', type: 'varchar', length: 255 })
  nombreCargo!: string;

  // Relación inversa: lista de usuarios que tienen asignado este cargo
  @OneToMany(() => Usuario, (u) => u.cargo)
  usuarios!: Usuario[];
}
