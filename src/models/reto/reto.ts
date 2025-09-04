// src/models/reto/reto.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoReto = 'quiz' | 'form' | 'archivo';

@Entity({ name: 'retos' })
export class Reto {
  @PrimaryGeneratedColumn({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  @Column({ name: 'nombre_reto', type: 'varchar', length: 255 })
  nombreReto!: string;

  @Column({ name: 'descripcion_reto', type: 'longtext' })
  descripcionReto!: string;

  @Column({ name: 'tiempo_estimado_seg_reto', type: 'int' })
  tiempoEstimadoSegReto!: number;

  @Column({ name: 'fecha_inicio_reto', type: 'date' })
  fechaInicioReto!: string;

  @Column({ name: 'fecha_fin_reto', type: 'date' })
  fechaFinReto!: string;

  @Column({ name: 'es_automatico_reto', type: 'tinyint', default: () => '0' })
  esAutomaticoReto!: number;

  @Column({
    name: 'tipo_reto',
    type: 'enum',
    enum: ['quiz', 'form', 'archivo'],
    default: 'quiz',
  })
  tipoReto!: TipoReto;

  @Column({ name: 'metadata_reto', type: 'json', nullable: true })
  metadataReto!: any | null;

  @Column({ name: 'activo', type: 'tinyint', default: () => '1' })
  activo!: number;
}
