// src/db/entities/preguntas/PreguntaRellenar.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pregunta } from './pregunta';

@Entity({ name: 'preguntas_rellenar' })
export class PreguntaRellenar {
  @PrimaryGeneratedColumn({ name: 'cod_pregunta_rellenar', type: 'int' })
  codPreguntaRellenar!: number;

  @Column({ name: 'texto_pregunta', type: 'text' })
  texto!: string;

  @Column({ name: 'respuesta_correcta', type: 'varchar', length: 255 })
  respuestaCorrecta!: string;

  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  @ManyToOne(() => Pregunta, (p) => p.rellenar, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
