// src/models/usuario-reto/usuario-reto.ts
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reto } from '../reto/reto';

// Estados posibles de un reto asignado a un usuario.
export type EstadoReto =
  | 'asignado'
  | 'en_progreso'
  | 'abandonado'
  | 'completado'
  | 'vencido';

/**
 * Representa la asignación de un reto a un usuario,
 * incluyendo estado, tiempos y ventana de cumplimiento.
 */
@Entity({ name: 'usuarios_retos' })
@Index('idx_usuarios_retos_fecha', ['fechaObjetivo'])
@Index('idx_usuarios_retos_ventana', ['ventanaInicio', 'ventanaFin'])
export class UsuarioReto {
  /**
   * Identificador interno de la asignación usuario–reto.
   */
  @PrimaryGeneratedColumn({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  /**
   * FK al usuario que recibe el reto.
   * Se maneja como id numérico para evitar cargar la entidad completa.
   */
  @Column({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  /**
   * FK al reto asignado.
   * Relación completa en la propiedad `reto`.
   */
  @Column({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  /**
   * Estado actual del reto para este usuario
   * (flujo: asignado → en_progreso → completado / abandonado / vencido).
   */
  @Column({
    name: 'estado',
    type: 'enum',
    enum: ['asignado', 'en_progreso', 'abandonado', 'completado', 'vencido'],
    default: 'asignado',
  })
  estado!: EstadoReto;

  /**
   * Fecha de compleción efectiva del reto (cuando se marca como completado).
   */
  @Column({ name: 'fecha_complecion', type: 'datetime', nullable: true })
  fechaComplecion!: Date | null;

  /**
   * Momento en que el usuario empezó a resolver el reto.
   */
  @Column({ name: 'empezado_en', type: 'datetime', nullable: true })
  empezadoEn!: Date | null;

  /**
   * Momento en que el usuario terminó su interacción con el reto
   * (puede coincidir o no con la fecha de compleción lógica).
   */
  @Column({ name: 'terminado_en', type: 'datetime', nullable: true })
  terminadoEn!: Date | null;

  /**
   * Duración total de compleción en segundos.
   * Es una columna generada en MySQL, por eso no se selecciona por defecto.
   */
  @Column({ name: 'tiempo_complecion_seg', type: 'int', nullable: true, select: false })
  tiempoComplecionSeg?: number | null;

  // ---------- Campos de calendario / planificación ----------

  /**
   * Día objetivo para completar el reto (modo “deadline” simple).
   */
  @Column({ name: 'fecha_objetivo', type: 'date', nullable: true })
  fechaObjetivo!: string | null;

  /**
   * Inicio de la ventana recomendada para realizar el reto.
   */
  @Column({ name: 'ventana_inicio', type: 'date', nullable: true })
  ventanaInicio!: string | null;

  /**
   * Fin de la ventana recomendada para realizar el reto.
   */
  @Column({ name: 'ventana_fin', type: 'date', nullable: true })
  ventanaFin!: string | null;

  // Relaciones opcionales (si usas lazy, marca como Promise<...>)
  // @ManyToOne(() => Usuario)
  // @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  // usuario!: Usuario;

  /**
   * Reto asociado a esta asignación.
   */
  @ManyToOne(() => Reto)
  @JoinColumn({ name: 'cod_reto', referencedColumnName: 'codReto' })
  reto!: Reto;
}
