// src/db/entities/preguntas/ItemEmparejamiento.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pregunta } from './pregunta';

export enum LadoEmparejamiento { A='A', B='B' }

@Entity({ name: 'items_emparejamiento' })
export class ItemEmparejamiento {
  @PrimaryGeneratedColumn({ name: 'cod_item', type: 'int' })
  codItem!: number;

  @Column({ name: 'lado', type: 'enum', enum: LadoEmparejamiento })
  lado!: LadoEmparejamiento;

  @Column({ name: 'contenido', type: 'varchar', length: 255 })
  contenido!: string;

  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  @ManyToOne(() => Pregunta, (p) => p.itemsEmparejar, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
