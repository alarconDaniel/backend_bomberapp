import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
// import { Usuario } from '../usuario/usuario'; // <- Descomenta si vas a usar la relación

@Entity({ name: 'roles' })
export class Rol {
  @PrimaryGeneratedColumn({ name: 'cod_rol', type: 'int' })
  codRol!: number;

  @Column({ name: 'nombre_rol', type: 'varchar', length: 255, unique: true })
  nombreRol!: string;

  // Relaciones (opcional):
  // @OneToMany(() => Usuario, (u) => u.rol)
  // usuarios!: Usuario[];
}
