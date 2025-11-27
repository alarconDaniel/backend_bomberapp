// src/models/respuestas/respuesta-quiz.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Proyección ligera de la tabla respuestas_preguntas_usuario.
 * Representa la respuesta de un usuario a UNA pregunta de un reto tipo quiz
 * (abcd / rellenar / emparejar / reporte evaluable).
 */
@Entity({ name: 'respuestas_preguntas_usuario' })
export class RespuestaQuiz {
  // PK autoincremental de la respuesta
  @PrimaryGeneratedColumn({ name: 'cod_respuesta', type: 'int' })
  codRespuesta!: number;

  // FK cruda a usuarios_retos.cod_usuario_reto (intento del reto por usuario)
  @Column({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  // FK cruda a preguntas.cod_pregunta (enunciado que se está respondiendo)
  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  // Marca de tiempo en la que se registró la respuesta (para métricas y control)
  @Column({
    name: 'respondido_en',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  respondidoEn!: Date;

  /**
   * Tiempo que tardó el usuario en responder esta pregunta en segundos.
   * Se usa para estadísticas (velocidad, “Relámpago en la Cabeza”, etc.).
   */
  @Column({ name: 'tiempo_seg', type: 'int', nullable: true })
  tiempoSeg!: number | null;

  /**
   * Respuesta cruda serializada en JSON.
   * Ejemplos según tipo de pregunta:
   * - abcd: { opcionSeleccionada: cod_opcion }
   * - rellenar: { texto: '...' }
   * - emparejar: { pares: [{ a: codItemA, b: codItemB }, ...] }
   * - reporte: { archivoId: '...', comentario?: '...' }
   */
  @Column({ name: 'valor_json', type: 'json', nullable: true })
  valorJson!: any | null;

  /**
   * Flag de corrección:
   * 1 → correcta, 0 → incorrecta, null → aún no evaluada / no aplica.
   * El cálculo depende del tipo de pregunta definida en preguntas.tipo_pregunta.
   */
  @Column({ name: 'es_correcta', type: 'tinyint', nullable: true })
  esCorrecta!: number | null;

  /**
   * Puntaje otorgado a esta respuesta concreta.
   * Es lo que luego suma a la XP / monedas del usuario.
   */
  @Column({ name: 'puntaje', type: 'int', nullable: true })
  puntaje!: number | null;
}
