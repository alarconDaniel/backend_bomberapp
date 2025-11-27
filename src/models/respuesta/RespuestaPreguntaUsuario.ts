// src/db/entities/respuestas/RespuestaPreguntaUsuario.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UsuarioReto } from './../usuario-reto/usuario-reto';
import { Pregunta } from '../pregunta/pregunta';

/**
 * Respuesta individual de una pregunta dentro de un reto asignado a un usuario.
 * Se usa tanto para preguntas tipo quiz como para reportes / emparejamientos, etc.
 */
@Entity({ name: 'respuestas_preguntas_usuario' })
export class RespuestaPreguntaUsuario {
  // Identificador interno de la respuesta de una pregunta puntual
  @PrimaryGeneratedColumn({ name: 'cod_respuesta', type: 'int' })
  codRespuesta!: number;

  // FK cruda a usuarios_retos.cod_usuario_reto (quién responde esta pregunta)
  @Column({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  // FK cruda a preguntas.cod_pregunta (qué pregunta se respondió)
  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  // Momento en el que se registró la respuesta (servido para métricas de actividad)
  @Column({
    name: 'respondido_en',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  respondidoEn!: Date;

  // Tiempo que se tardó el usuario en responder la pregunta (en segundos)
  @Column({ name: 'tiempo_seg', type: 'int', nullable: true })
  tiempoSeg?: number | null;

  /**
   * Valor de la respuesta en formato JSON.
   * - ABCD: opción seleccionada (o lista si soportas multi).
   * - rellenar: texto libre.
   * - emparejar: pares de items A–B.
   * - reporte: metadatos del archivo, id de carga, etc.
   */
  @Column({ name: 'valor_json', type: 'json', nullable: true })
  valorJson?: any;

  /**
   * Flag de corrección automática:
   * - true  => respuesta correcta
   * - false => respuesta incorrecta
   * - null  => pendiente de revisión manual o no aplica (p.ej. ciertos reportes)
   */
  @Column({ name: 'es_correcta', type: 'tinyint', width: 1, nullable: true })
  esCorrecta?: boolean | null;

  // Puntaje obtenido en esta pregunta (puede diferir de puntos_pregunta si hay penalizaciones o parciales)
  @Column({ name: 'puntaje', type: 'int', nullable: true })
  puntaje?: number | null;

  // Relación con la asignación usuario-reto (estado, ventana, potenciadores, etc.)
  @ManyToOne(() => UsuarioReto, (ur) => ur /* opcional: respuestas */, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'cod_usuario_reto',
    referencedColumnName: 'codUsuarioReto',
  })
  usuarioReto!: UsuarioReto;

  // Relación con la pregunta original (para saber tipo, puntos, tiempo máximo, etc.)
  @ManyToOne(() => Pregunta, (p) => p.respuestas, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
