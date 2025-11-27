// src/models/cargo-reto/cargo-reto.ts
import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'cargos_retos' })
// Tabla rompe que relaciona cargos de usuario con retos disponibles para ese cargo
@Index('idx_cargos_retos_cargo', ['codCargoUsuario'])
@Index('idx_cargos_retos_reto', ['codReto'])
export class CargoReto {
  @PrimaryGeneratedColumn({ name: 'cod_cargo_reto', type: 'int' })
  codCargoReto!: number;

  // FK al cargo de usuario
  @Column({ name: 'cod_cargo_usuario', type: 'int' })
  codCargoUsuario!: number;

  // FK al reto que aplica a ese cargo
  @Column({ name: 'cod_reto', type: 'int' })
  codReto!: number;
}
