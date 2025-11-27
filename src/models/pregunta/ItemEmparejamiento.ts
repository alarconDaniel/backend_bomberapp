// src/db/entities/preguntas/ItemEmparejamiento.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pregunta } from './pregunta';

// Lado de la pareja dentro de la pregunta de emparejamiento (columna A o columna B)
export enum LadoEmparejamiento { A = 'A', B = 'B' }

@Entity({ name: 'items_emparejamiento' })
export class ItemEmparejamiento {
  // Identificador único del ítem dentro de la tabla de emparejamiento
  @PrimaryGeneratedColumn({ name: 'cod_item', type: 'int' })
  codItem!: number;

  // Indica en qué lado de la pregunta aparece este ítem (columna A o B)
  @Column({ name: 'lado', type: 'enum', enum: LadoEmparejamiento })
  lado!: LadoEmparejamiento;

  // Texto que verá el usuario para este ítem (ej. "Motor de giro", "Bomba estacionaria")
  @Column({ name: 'contenido', type: 'varchar', length: 255 })
  contenido!: string;

  // FK cruda a la pregunta de emparejamiento en la tabla `preguntas`
  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  // Relación hacia la pregunta a la que pertenece este ítem de emparejamiento
  @ManyToOne(() => Pregunta, (p) => p.itemsEmparejar, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
