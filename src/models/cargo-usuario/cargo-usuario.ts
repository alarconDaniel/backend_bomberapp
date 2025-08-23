import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
// import { Usuario } from '../usuario/usuario'; // <- Descomenta si vas a usar la relación

@Entity({ name: 'cargos_usuarios' })
export class CargoUsuario {
  @PrimaryGeneratedColumn({ name: 'cod_cargo_usuario', type: 'int' })
  codCargoUsuario!: number;

  @Column({ name: 'nombre_cargo', type: 'varchar', length: 255, unique: true })
  nombreCargo!: string;

  // Relaciones (opcional):
  // @OneToMany(() => Usuario, (u) => u.cargo)
  // usuarios!: Usuario[];
}
