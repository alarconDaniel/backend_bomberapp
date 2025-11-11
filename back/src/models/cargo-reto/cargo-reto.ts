// src/models/cargo-reto/cargo-reto.ts
import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'cargos_retos' })
@Index('idx_cargos_retos_cargo', ['codCargoUsuario'])
@Index('idx_cargos_retos_reto', ['codReto'])
export class CargoReto {
  @PrimaryGeneratedColumn({ name: 'cod_cargo_reto', type: 'int' })
  codCargoReto!: number;

  @Column({ name: 'cod_cargo_usuario', type: 'int' })
  codCargoUsuario!: number;

  @Column({ name: 'cod_reto', type: 'int' })
  codReto!: number;
}
