
// src/db/entities/preguntas/OpcionABCD.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pregunta } from './pregunta';

@Entity({ name: 'opciones_abcd' })
export class OpcionABCD {
  @PrimaryGeneratedColumn({ name: 'cod_opcion', type: 'int' })
  codOpcion!: number;

  @Column({ name: 'texto_opcion', type: 'varchar', length: 255 })
  texto!: string;

  @Column({ name: 'validez_opcion', type: 'tinyint', width: 1, default: 0 })
  validez!: boolean;

  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  @ManyToOne(() => Pregunta, (p) => p.opcionesABCD, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
