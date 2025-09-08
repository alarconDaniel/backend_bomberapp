// src/db/entities/preguntas/ParejaCorrecta.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pregunta } from './pregunta';

@Entity({ name: 'parejas_correctas' })
export class ParejaCorrecta {
  @PrimaryGeneratedColumn({ name: 'cod_pareja', type: 'int' })
  codPareja!: number;

  @Column({ name: 'cod_item_A', type: 'int' })
  codItemA!: number;

  @Column({ name: 'cod_item_B', type: 'int' })
  codItemB!: number;

  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  @ManyToOne(() => Pregunta, (p) => p.parejas, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
