
// src/db/entities/respuestas/RespuestaPreguntaUsuario.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioReto } from './../usuario-reto/usuario-reto';
import { Pregunta } from '../pregunta/pregunta';

@Entity({ name: 'respuestas_preguntas_usuario' })
export class RespuestaPreguntaUsuario {
  @PrimaryGeneratedColumn({ name: 'cod_respuesta', type: 'int' })
  codRespuesta!: number;

  @Column({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  @Column({ name: 'cod_pregunta', type: 'int' })
  codPregunta!: number;

  @Column({ name: 'respondido_en', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  respondidoEn!: Date;

  @Column({ name: 'tiempo_seg', type: 'int', nullable: true })
  tiempoSeg?: number | null;

  @Column({ name: 'valor_json', type: 'json', nullable: true })
  valorJson?: any;

  @Column({ name: 'es_correcta', type: 'tinyint', width: 1, nullable: true })
  esCorrecta?: boolean | null;

  @Column({ name: 'puntaje', type: 'int', nullable: true })
  puntaje?: number | null;

  @ManyToOne(() => UsuarioReto, (ur) => ur /* opcional: respuestas */, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_usuario_reto', referencedColumnName: 'codUsuarioReto' })
  usuarioReto!: UsuarioReto;

  @ManyToOne(() => Pregunta, (p) => p.respuestas, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_pregunta', referencedColumnName: 'codPregunta' })
  pregunta!: Pregunta;
}
