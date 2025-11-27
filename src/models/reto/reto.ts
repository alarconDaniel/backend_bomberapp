// src/models/reto/reto.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Pregunta } from '../pregunta/pregunta';
import { RespuestaFormularioUsuario } from './../respuesta/RespuestaFormularioUsuario';
import { UsuarioReto } from './../usuario-reto/usuario-reto';

/**
 * Tipo de reto según lo que hace el usuario:
 * - 'quiz'    → preguntas (abcd / rellenar / emparejar / reporte evaluable)
 * - 'form'    → formularios tipo checklist / actas (metadata_reto.schema)
 * - 'archivo' → subida de archivos (PDF, imágenes, videos) según metadata_reto
 */
export type TipoReto = 'quiz' | 'form' | 'archivo';

/**
 * Proyección ligera de la tabla `retos`.
 *
 * Algunos ejemplos reales de la BD:
 * - 'Checklist MTTO preventivo - Torre Grúa'  (tipo_reto = 'form')
 * - 'Lista de chequeo bomba estacionaria de concreto' (tipo_reto = 'form')
 * - 'Entrega de reporte PDF' / 'Evidencia fotográfica' (tipo_reto = 'archivo')
 * - Quizzes clásicos con preguntas y opciones (tipo_reto = 'quiz')
 */
@Entity({ name: 'retos' })
export class Reto {
  /** PK autoincremental del reto */
  @PrimaryGeneratedColumn({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  /** Nombre visible del reto en la app (título de la tarjeta/listado) */
  @Column({ name: 'nombre_reto', type: 'varchar', length: 255 })
  nombreReto!: string;

  /**
   * Descripción larga del reto.
   * Aquí viven instrucciones de negocio, contexto y “qué se espera entregar”.
   */
  @Column({ name: 'descripcion_reto', type: 'longtext' })
  descripcionReto!: string;

  /**
   * Tiempo estimado en segundos para completarlo.
   * Se usa para mostrar timers y cálculo de ritmo (logros de velocidad).
   */
  @Column({ name: 'tiempo_estimado_seg_reto', type: 'int' })
  tiempoEstimadoSegReto!: number;

  /** Fecha desde la cual el reto puede verse / jugarse. */
  @Column({ name: 'fecha_inicio_reto', type: 'date' })
  fechaInicioReto!: string;

  /** Fecha límite de vigencia del reto (no necesariamente igual a `activo`). */
  @Column({ name: 'fecha_fin_reto', type: 'date' })
  fechaFinReto!: string;

  /**
   * Flag 0/1:
   * - 0 → reto normal (asignado puntualmente a usuarios/cargos)
   * - 1 → reto automático/plantilla (vigente largo tiempo, p.ej. 2099-12-31)
   * usado para generar asignaciones recurrentes como checklists de rutina.
   */
  @Column({ name: 'es_automatico_reto', type: 'tinyint', default: () => '0' })
  esAutomaticoReto!: number;

  /**
   * Tipo de reto:
   * - quiz    → usa preguntas/opciones (preguntas, opciones_abcd, etc.)
   * - form    → usa formularios dinámicos (metadata_reto.schema)
   * - archivo → subida de archivos según restricciones en metadata_reto
   */
  @Column({
    name: 'tipo_reto',
    type: 'enum',
    enum: ['quiz', 'form', 'archivo'],
    default: 'quiz',
  })
  tipoReto!: TipoReto;

  /**
   * Configuración específica del reto (JSON).
   * Ejemplos reales:
   * - Checklists: { kind, schema: { header, items, columnsByGroup, ... }, ui: {...} }
   * - Retos de archivo: { kind: 'archivo', instrucciones, tiposPermitidos: ['pdf', ...] }
   */
  @Column({ name: 'metadata_reto', type: 'json', nullable: true })
  metadataReto!: any | null;

  /**
   * Flag 0/1 para activar o “apagar” el reto sin borrar datos históricos.
   * Afecta si se muestra o no en catálogos/asignaciones nuevas.
   */
  @Column({ name: 'activo', type: 'tinyint', default: () => '1' })
  activo!: number;

  /** 1:N con Pregunta (retos.cod_reto ← preguntas.cod_reto) */
  @OneToMany(() => Pregunta, (p) => p.reto)
  preguntas!: Pregunta[];

  /**
   * 1:N con UsuarioReto.
   * Cada fila en usuarios_retos representa una asignación/instancia
   * de este reto para un usuario concreto (con estado, ventana, etc.).
   */
  @OneToMany(() => UsuarioReto, (ur) => ur.reto)
  usuariosRetos!: UsuarioReto[];

  /**
   * 1:N con RespuestaFormularioUsuario.
   * Solo aplica cuando tipo_reto = 'form': aquí se guardan los JSON
   * diligenciados por usuario para el formulario definido en metadata_reto.
   */
  @OneToMany(() => RespuestaFormularioUsuario, (rf) => rf.reto)
  respuestasForm!: RespuestaFormularioUsuario[];
}
