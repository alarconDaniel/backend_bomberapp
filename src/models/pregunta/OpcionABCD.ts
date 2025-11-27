// src/db/entities/preguntas/OpcionABCD.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pregunta } from './pregunta';

@Entity({ name: 'opciones_abcd' })
export class OpcionABCD {
  // Identificador único de la opción de respuesta (A/B/C/D, etc.)
  @PrimaryGeneratedColumn({ name: 'cod_opcion', type: 'int' })
  codOpcion!: number;

  // Texto visible para el usuario en la alternativa 
  @Column({ name: 'texto_opcion', type: 'varchar', length: 255 })
  texto!: string;

  // Marca si la opción es correcta (1) o no (0) dentro de la pregunta
  @Column({ name: 'validez_opcion', type: 'tinyint', width: 1, default: 0 })
  validez!: boolean;

  // FK cruda a la pregunta a la que pertenece esta opción
  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  // Relación hacia la pregunta padre (una pregunta tiene varias opciones ABCD)
  @ManyToOne(() => Pregunta, (p) => p.opcionesABCD, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
