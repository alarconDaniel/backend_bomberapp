// src/db/entities/preguntas/ParejaCorrecta.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pregunta } from './pregunta';

@Entity({ name: 'parejas_correctas' })
export class ParejaCorrecta {
  // Identificador único de la pareja correcta dentro de la pregunta
  @PrimaryGeneratedColumn({ name: 'cod_pareja', type: 'int' })
  codPareja!: number;

  // FK al ítem del lado A (items_emparejamiento.lado = 'A')
  @Column({ name: 'cod_item_A', type: 'int' })
  codItemA!: number;

  // FK al ítem del lado B (items_emparejamiento.lado = 'B')
  @Column({ name: 'cod_item_B', type: 'int' })
  codItemB!: number;

  // FK cruda a la pregunta a la que pertenece esta pareja
  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  // Relación hacia la pregunta padre (una pregunta tiene varias parejas correctas)
  @ManyToOne(() => Pregunta, (p) => p.parejas, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
