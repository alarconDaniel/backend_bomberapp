// // src/db/entities/preguntas/PreguntaReporte.ts
// import {
//   Column,
//   Entity,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   JoinColumn,
//   OneToMany,
// } from 'typeorm';
// import { Pregunta } from './pregunta';
// import { ReporteCargado } from './ReporteCargado';

// @Entity({ name: 'preguntas_reporte' })
// export class PreguntaReporte {
//   // Id interno del “subtipo” de pregunta que exige subir un archivo / reporte
//   @PrimaryGeneratedColumn({ name: 'cod_pregunta_reporte', type: 'int' })
//   codPreguntaReporte!: number;

//   // Texto corto que se muestra como instrucciones al usuario (ej: “Adjuntar reporte técnico en PDF”)
//   @Column({ name: 'instrucciones_pregunta', type: 'varchar', length: 255 })
//   instrucciones!: string;

//   // SET de tipos de archivo permitidos para esta pregunta (pdf, imágenes, docs, etc.)
//   // En BD se usa un SET; aquí se refleja como array de strings restringidos al enum
//   @Column({
//     name: 'tipo_archivo_permitido',
//     type: 'set',
//     enum: ['pdf', 'jpg', 'png', 'docx'],
//   })
//   tiposPermitidos!: ('pdf' | 'jpg' | 'png' | 'docx')[];

//   // FK cruda a preguntas.cod_pregunta (pregunta padre de tipo "reporte"/"archivo")
//   @Column({ name: 'cod_pregunta', type: 'int' })
//   codPregunta!: number;

//   // Relación con la pregunta principal; una pregunta puede tener exactamente una config de reporte
//   @ManyToOne(() => Pregunta, (p) => p.reporte, {
//     onDelete: 'NO ACTION',
//     onUpdate: 'NO ACTION',
//   })
//   @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
//   pregunta!: Pregunta;

//   // Reportes/archivos que el usuario ha cargado para esta configuración de pregunta
//   @OneToMany(() => ReporteCargado, (r) => r.preguntaReporte)
//   reportes!: ReporteCargado[];
// }
