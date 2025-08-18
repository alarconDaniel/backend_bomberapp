// src/db/entities/estadistica-usuario/EstadisticaUsuario.ts
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'estadisticas_usuarios' })
export class EstadisticaUsuario {
  // Parte 1 de PK (AUTO_INCREMENT)
  @PrimaryGeneratedColumn({ name: 'cod_estadistica', type: 'int' })
  codEstadistica!: number;

  // Parte 2 de PK (ref a usuarios.cod_usuario)
  // Nota: no definimos @Column separado; el JoinColumn crea la columna 'cod_usuario'.
  @OneToOne(() => Usuario, (u) => u.estadisticas, { eager: true })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  @Index('fk_estadisticas_usuario_usuarios1') // coincide con tu FK (nombre orientativo)
  usuario!: Usuario;

  @Column({ name: 'monedas_estadistica', type: 'int', default: 0 })
  monedas!: number;

  @Column({ name: 'racha_estadistica', type: 'int', default: 0 })
  racha!: number;

  @Column({
    name: 'xp_estadistica',
    type: 'int',
    default: 0,
    comment:
      'La experiencia total con la que cuenta el usuario; niveles se calculan en el backend',
  })
  xp!: number;
}
