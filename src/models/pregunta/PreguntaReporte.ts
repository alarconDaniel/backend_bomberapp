// src/db/entities/preguntas/PreguntaReporte.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Pregunta } from './pregunta';
import { ReporteCargado } from './ReporteCargado';

@Entity({ name: 'preguntas_reporte' })
export class PreguntaReporte {
  @PrimaryGeneratedColumn({ name: 'cod_pregunta_reporte', type: 'int' })
  codPreguntaReporte!: number;

  @Column({ name: 'instrucciones_pregunta', type: 'varchar', length: 255 })
  instrucciones!: string;

  // MySQL SET -> puedes mapear como 'set' si tu TypeORM lo soporta; si no, usa 'simple-array'
  @Column({
    name: 'tipo_archivo_permitido',
    type: 'set',
    enum: ['pdf', 'jpg', 'png', 'docx'],
  })
  tiposPermitidos!: ('pdf'|'jpg'|'png'|'docx')[];

  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  @ManyToOne(() => Pregunta, (p) => p.reporte, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;

  @OneToMany(() => ReporteCargado, (r) => r.preguntaReporte)
  reportes!: ReporteCargado[];
}
