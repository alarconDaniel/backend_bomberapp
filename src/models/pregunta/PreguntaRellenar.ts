// src/db/entities/preguntas/PreguntaRellenar.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pregunta } from './pregunta';

@Entity({ name: 'preguntas_rellenar' })
export class PreguntaRellenar {
  // Id interno del “sub-item” de rellenar asociado a una pregunta
  @PrimaryGeneratedColumn({ name: 'cod_pregunta_rellenar', type: 'int' })
  codPreguntaRellenar!: number;

  // Texto con huecos o frase donde el usuario debe escribir la respuesta
  @Column({ name: 'texto_pregunta', type: 'text' })
  texto!: string;

  // Respuesta correcta esperada para este hueco / frase
  @Column({ name: 'respuesta_correcta', type: 'varchar', length: 255 })
  respuestaCorrecta!: string;

  // FK cruda a preguntas.cod_pregunta (la “pregunta padre” de tipo rellenar)
  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  // Relación con la pregunta principal; una pregunta puede tener varios campos a rellenar
  @ManyToOne(() => Pregunta, (p) => p.rellenar, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
