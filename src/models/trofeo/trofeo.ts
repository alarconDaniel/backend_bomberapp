// src/models/trofeo/trofeo.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'trofeos' })
export class Trofeo {
  @PrimaryGeneratedColumn({ name: 'cod_trofeo', type: 'int' })
  codTrofeo!: number;

  @Column({ name: 'nombre_trofeo', type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ name: 'descripcion_trofeo', type: 'mediumtext' })
  descripcion!: string;

  @Column({ name: 'icono_trofeo', type: 'varchar', length: 255 })
  icono!: string;

  @Column({ name: 'recompensa_trofeo', type: 'varchar', length: 255 })
  recompensa!: string;

  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  dueño!: Usuario | null;
}
