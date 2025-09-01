// src/models/respuestas/respuesta-form.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'respuestas_formulario_usuario' })
export class RespuestaFormulario {
  @PrimaryGeneratedColumn({ name: 'cod_respuesta_form', type: 'int' })
  codRespuestaForm!: number;

  @Column({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  @Column({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  @Column({ name: 'data', type: 'json' })
  data!: any;

  @Column({ name: 'creado_en', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn!: Date;

  @Column({ name: 'terminado_en', type: 'datetime', nullable: true })
  terminadoEn!: Date | null;
}