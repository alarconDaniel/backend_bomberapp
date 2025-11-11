
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
  import { OpcionABCD } from './OpcionABCD';
  import { PreguntaRellenar } from './PreguntaRellenar';
  import { ItemEmparejamiento } from './ItemEmparejamiento';
  import { ParejaCorrecta } from './ParejaCorrecta';
  import { PreguntaReporte } from './PreguntaReporte';
  import { RespuestaPreguntaUsuario } from './../respuesta/RespuestaPreguntaUsuario';
  
  export enum TipoPregunta {
    ABCD = 'abcd',
    RELLENAR = 'rellenar',
    EMPAREJAR = 'emparejar',
    REPORTE = 'reporte',
  }
  
  @Entity({ name: 'preguntas' })
  @Index(['codReto', 'numeroPregunta'], { unique: true }) // evita duplicar orden por reto
  export class Pregunta {
    @PrimaryGeneratedColumn({ name: 'cod_pregunta', type: 'int' })
    codPregunta!: number;
  
    @Column({ name: 'numero_pregunta', type: 'int' })
    numeroPregunta!: number; // orden dentro del reto
  
    @Column({ name: 'enunciado_pregunta', type: 'text' })
    enunciado!: string;
  
    @Column({
      name: 'tipo_pregunta',
      type: 'enum',
      enum: TipoPregunta,
    })
    tipo!: TipoPregunta;
  
    @Column({ name: 'puntos_pregunta', type: 'int', default: 1 })
    puntos!: number;
  
    @Column({ name: 'tiempo_max_pregunta', type: 'int' })
    tiempoMax!: number; // en segundos
  
    /** FK → retos.cod_reto */
    @Column({ name: 'cod_reto', type: 'int' })
    codReto!: number;
  
    @ManyToOne(() => Reto, (r) => r.preguntas, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
    @JoinColumn({ name: 'cod_reto', referencedColumnName: 'codReto' })
    reto!: Reto;
  
    @OneToMany(() => OpcionABCD, (o) => o.pregunta) opcionesABCD!: OpcionABCD[];
    @OneToMany(() => PreguntaRellenar, (r) => r.pregunta) rellenar!: PreguntaRellenar[];
    @OneToMany(() => ItemEmparejamiento, (i) => i.pregunta) itemsEmparejar!: ItemEmparejamiento[];
    @OneToMany(() => ParejaCorrecta, (p) => p.pregunta) parejas!: ParejaCorrecta[];
    @OneToMany(() => PreguntaReporte, (pr) => pr.pregunta) reporte!: PreguntaReporte[];
    @OneToMany(() => RespuestaPreguntaUsuario, (rp) => rp.pregunta) respuestas!: RespuestaPreguntaUsuario[];
  }
  