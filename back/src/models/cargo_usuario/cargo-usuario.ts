// src/models/cargo-usuario/CargoUsuario.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'cargos_usuarios' })
export class CargoUsuario {
  @PrimaryGeneratedColumn({ name: 'cod_cargo_usuario', type: 'int' })
  codCargoUsuario!: number;

  @Column({ name: 'nombre_cargo', type: 'varchar', length: 255 })
  nombreCargo!: string;

  @OneToMany(() => Usuario, (u) => u.cargo)
  usuarios!: Usuario[];
}
