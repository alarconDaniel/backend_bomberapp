// src/db/entities/preguntas/Pregunta.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Reto } from './../reto/reto';

import { PreguntaRellenar } from './PreguntaRellenar';
import { ItemEmparejamiento } from './ItemEmparejamiento';
import { ParejaCorrecta } from './ParejaCorrecta';
import { RespuestaPreguntaUsuario } from './../respuesta/RespuestaPreguntaUsuario';
import { OpcionABCD } from './OpcionABCD';


/**
 * Tipos de pregunta soportados en el motor de retos:
 * - abcd: selección múltiple clásica
 * - rellenar: completar texto
 * - emparejar: relacionar columnas A/B
 * - reporte: pregunta que se responde con archivo / reporte cargado
 */
export enum TipoPregunta {
  ABCD = 'abcd',
  RELLENAR = 'rellenar',
  EMPAREJAR = 'emparejar',
}

@Entity({ name: 'preguntas' })
@Index(['codReto', 'numeroPregunta'], { unique: true }) // asegura que no se repita el orden dentro de un mismo reto
export class Pregunta {
  // Identificador único de la pregunta
  @PrimaryGeneratedColumn({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  // Orden de la pregunta dentro del reto (1,2,3,...) – ver índice único con codReto
  @Column({ name: 'numero_pregunta', type: 'int' })
  numeroPregunta!: number;

  // Enunciado visible para el usuario
  @Column({ name: 'enunciado_pregunta', type: 'text' })
  enunciado!: string;

  // Tipo de pregunta; controla qué tablas relacionadas se usan (ABCD, rellenar, emparejar, reporte)
  @Column({
    name: 'tipo_pregunta',
    type: 'enum',
    enum: TipoPregunta,
  })
  tipo!: TipoPregunta;

  // Puntos que aporta esta pregunta al resultado del reto
  @Column({ name: 'puntos_pregunta', type: 'int', default: 1 })
  puntos!: number;

  // Tiempo máximo para responder la pregunta (en segundos)
  @Column({ name: 'tiempo_max_pregunta', type: 'int' })
  tiempoMax!: number;

  /** FK cruda → retos.cod_reto (reto al que pertenece esta pregunta) */
  @Column({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  // Relación hacia el reto padre (un reto puede tener varias preguntas)
  @ManyToOne(() => Reto, (r) => r.preguntas, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cod_reto', referencedColumnName: 'codReto' })
  reto!: Reto;

  // Opciones de selección múltiple (solo aplica cuando tipo = ABCD)
  @OneToMany(() => OpcionABCD, (o) => o.pregunta)
  opcionesABCD!: OpcionABCD[];

  // Configuración de huecos / campos a rellenar (tipo = RELLENAR)
  @OneToMany(() => PreguntaRellenar, (r) => r.pregunta)
  rellenar!: PreguntaRellenar[];

  // Ítems de los lados A y B para preguntas de emparejar (tipo = EMPAREJAR)
  @OneToMany(() => ItemEmparejamiento, (i) => i.pregunta)
  itemsEmparejar!: ItemEmparejamiento[];

  // Pares correctos entre ítems A/B (clave de evaluación en EMPAREJAR)
  @OneToMany(() => ParejaCorrecta, (p) => p.pregunta)
  parejas!: ParejaCorrecta[];

  // Respuestas que han dado los usuarios a esta pregunta
  @OneToMany(() => RespuestaPreguntaUsuario, (rp) => rp.pregunta)
  respuestas!: RespuestaPreguntaUsuario[];
}
