// src/db/entities/respuestas/RespuestaFormularioUsuario.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioReto } from './../usuario-reto/usuario-reto';
import { Reto } from '../reto/reto';

@Entity({ name: 'respuestas_formulario_usuario' })
export class RespuestaFormularioUsuario {
  @PrimaryGeneratedColumn({ name: 'cod_respuesta_form', type: 'int' })
  codRespuestaForm!: number;

  @Column({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  @Column({ name: 'data', type: 'json' })
  data!: any;

  @Column({ name: 'creado_en', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn!: Date;

  @Column({ name: 'terminado_en', type: 'datetime', nullable: true })
  terminadoEn?: Date | null;

  @Column({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  @ManyToOne(() => UsuarioReto, (ur) => ur /* opcional: respuestasForm */, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_usuario_reto', referencedColumnName: 'codUsuarioReto' })
  usuarioReto!: UsuarioReto;

  @ManyToOne(() => Reto, (r) => r.respuestasForm, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'cod_reto', referencedColumnName: 'codReto' })
  reto!: Reto;
}
