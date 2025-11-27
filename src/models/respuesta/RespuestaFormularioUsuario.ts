// src/db/entities/respuestas/RespuestaFormularioUsuario.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UsuarioReto } from './../usuario-reto/usuario-reto';
import { Reto } from '../reto/reto';

@Entity({ name: 'respuestas_formulario_usuario' })
export class RespuestaFormularioUsuario {
  // Identificador interno de la respuesta de formulario (una instancia de envío)
  @PrimaryGeneratedColumn({ name: 'cod_respuesta_form', type: 'int' })
  codRespuestaForm!: number;

  // FK cruda a usuarios_retos.cod_usuario_reto (quién está respondiendo este formulario en este reto)
  @Column({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  // Payload completo del formulario en formato JSON (respeta el schema definido en metadata_reto)
  @Column({ name: 'data', type: 'json' })
  data!: any;

  // Cuándo se creó la respuesta (primer guardado o arranque del formulario)
  @Column({
    name: 'creado_en',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creadoEn!: Date;

  // Cuándo el usuario terminó el formulario; null si aún está en progreso/borrador
  @Column({ name: 'terminado_en', type: 'datetime', nullable: true })
  terminadoEn?: Date | null;

  // FK cruda a retos.cod_reto (plantilla/formulario al que responde)
  @Column({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  // Relación con la asignación usuario-reto (estado, ventana, etc.)
  @ManyToOne(() => UsuarioReto, (ur) => ur /* opcional: respuestasForm */, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'cod_usuario_reto',
    referencedColumnName: 'codUsuarioReto',
  })
  usuarioReto!: UsuarioReto;

  // Relación con el reto dueño del formulario (usa los retos tipo "form" y sus metadata_reto.*)
  @ManyToOne(() => Reto, (r) => r.respuestasForm, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cod_reto', referencedColumnName: 'codReto' })
  reto!: Reto;
}
