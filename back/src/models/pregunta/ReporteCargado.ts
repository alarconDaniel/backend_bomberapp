// src/db/entities/preguntas/ReporteCargado.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PreguntaReporte } from './PreguntaReporte';

@Entity({ name: 'reportes_cargados' })
export class ReporteCargado {
  @PrimaryGeneratedColumn({ name: 'cod_reporte', type: 'int' })
  codReporte!: number;

  @Column({ name: 'ruta_archivo_reporte', type: 'varchar', length: 255 })
  rutaArchivo!: string;

  @Column({ name: 'fecha_envio_reporte', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaEnvio!: Date;

  @Column({ name: 'cod_pregunta_reporte', type: 'int' })
  codPreguntaReporte!: number;

  @ManyToOne(() => PreguntaReporte, (pr) => pr.reportes, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_pregunta_reporte', referencedColumnName: 'codPreguntaReporte' })
  preguntaReporte!: PreguntaReporte;
}
