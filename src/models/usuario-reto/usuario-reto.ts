// src/models/usuario-reto/usuario-reto.ts
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reto } from '../reto/reto';

// Si necesitas la entidad Usuario, importa la tuya:
// import { Usuario } from '../usuario/usuario';

export type EstadoReto = 'asignado' | 'en_progreso' | 'abandonado' | 'completado' | 'vencido';

@Entity({ name: 'usuarios_retos' })
@Index('idx_usuarios_retos_fecha', ['fechaObjetivo'])
@Index('idx_usuarios_retos_ventana', ['ventanaInicio', 'ventanaFin'])
export class UsuarioReto {
  @PrimaryGeneratedColumn({ name: 'cod_usuario_reto', type: 'int' })
  codUsuarioReto!: number;

  @Column({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  @Column({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: ['asignado', 'en_progreso', 'abandonado', 'completado', 'vencido'],
    default: 'asignado',
  })
  estado!: EstadoReto;

  @Column({ name: 'fecha_complecion', type: 'datetime', nullable: true })
  fechaComplecion!: Date | null;

  @Column({ name: 'empezado_en', type: 'datetime', nullable: true })
  empezadoEn!: Date | null;

  @Column({ name: 'terminado_en', type: 'datetime', nullable: true })
  terminadoEn!: Date | null;

  // Columna generada en MySQL: no se escribe; mejor no seleccionarla por defecto
  @Column({ name: 'tiempo_complecion_seg', type: 'int', nullable: true, select: false })
  tiempoComplecionSeg?: number | null;

  // Calendario:
  @Column({ name: 'fecha_objetivo', type: 'date', nullable: true })
  fechaObjetivo!: string | null; // single-day

  @Column({ name: 'ventana_inicio', type: 'date', nullable: true })
  ventanaInicio!: string | null;

  @Column({ name: 'ventana_fin', type: 'date', nullable: true })
  ventanaFin!: string | null;

  // Relaciones opcionales (si usas lazy, marca como Promise<...>)
  // @ManyToOne(() => Usuario)
  // @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  // usuario!: Usuario;

  @ManyToOne(() => Reto)
  @JoinColumn({ name: 'cod_reto', referencedColumnName: 'codReto' })
  reto!: Reto;
}
