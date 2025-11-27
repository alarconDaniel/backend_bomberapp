// src/models/trofeo/trofeo.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'trofeos' })
export class Trofeo {
  /**
   * Identificador único del trofeo.
   */
  @PrimaryGeneratedColumn({ name: 'cod_trofeo', type: 'int' })
  codTrofeo!: number;

  /**
   * Nombre visible del trofeo (título corto).
   */
  @Column({ name: 'nombre_trofeo', type: 'varchar', length: 255 })
  nombre!: string;

  /**
   * Descripción detallada del trofeo y cómo se obtiene.
   */
  @Column({ name: 'descripcion_trofeo', type: 'mediumtext' })
  descripcion!: string;

  /**
   * Ruta o key del icono del trofeo.
   */
  @Column({ name: 'icono_trofeo', type: 'varchar', length: 255 })
  icono!: string;

  /**
   * Texto que describe la recompensa asociada al trofeo
   * (monedas, puntos, ítems, etc.).
   */
  @Column({ name: 'recompensa_trofeo', type: 'varchar', length: 255 })
  recompensa!: string;

  /**
   * Usuario dueño del trofeo, si aplica.
   *
   * En la BD la FK es trofeos.cod_usuario (nullable), y aquí se carga en eager
   * para tener el dueño disponible directamente al leer el trofeo.
   */
  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  dueño!: Usuario | null;

  /**
   * Identificador del usuario dueño (FK cruda).
   *
   * No es una columna física en la tabla; TypeORM la resuelve a partir
   * de la relación con `dueño`, útil cuando solo necesitas el id.
   */
  @RelationId((t: Trofeo) => t.dueño)
  codUsuario!: number | null;
}
