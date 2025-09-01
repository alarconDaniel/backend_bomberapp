// src/models/respuestas/respuesta-quiz.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'respuestas_preguntas_usuario' })
export class RespuestaQuiz {
  @PrimaryGeneratedColumn({ name: 'cod_respuesta', type: 'int' })
  codRespuesta!: number;

  @Column({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  @Column({ name: 'respondido_en', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  respondidoEn!: Date;

  @Column({ name: 'tiempo_seg', type: 'int', nullable: true })
  tiempoSeg!: number | null;

  @Column({ name: 'valor_json', type: 'json', nullable: true })
  valorJson!: any | null;

  @Column({ name: 'es_correcta', type: 'tinyint', nullable: true })
  esCorrecta!: number | null;

  @Column({ name: 'puntaje', type: 'int', nullable: true })
  puntaje!: number | null;
}