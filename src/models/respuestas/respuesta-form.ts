// src/models/respuestas/respuesta-form.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Proyección ligera de la tabla respuestas_formulario_usuario para el dominio.
 * Se usa para leer/escribir respuestas de retos tipo "formulario" (metadata_reto.kind = form).
 */
@Entity({ name: 'respuestas_formulario_usuario' })
export class RespuestaFormulario {
  // PK autoincremental de la respuesta de formulario
  @PrimaryGeneratedColumn({ name: 'cod_respuesta_form', type: 'int' })
  codRespuestaForm!: number;

  // FK cruda a usuarios_retos.cod_usuario_reto (instancia del reto asignado)
  @Column({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  // FK cruda a retos.cod_reto (plantilla base del formulario)
  @Column({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  /**
   * Respuesta completa serializada en JSON.
   * Aquí se guarda:
   * - encabezado del formulario
   * - filas/ítems contestados
   * - adjuntos referenciados (ids, rutas, etc.)
   */
  @Column({ name: 'data', type: 'json' })
  data!: any;

  // Marca cuándo se empezó a llenar el formulario (para métricas y borradores)
  @Column({
    name: 'creado_en',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creadoEn!: Date;

  // Momento en que el usuario terminó/envió el formulario; null si está en progreso
  @Column({ name: 'terminado_en', type: 'datetime', nullable: true })
  terminadoEn!: Date | null;
}
