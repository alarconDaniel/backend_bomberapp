// src/models/archivo/archivo.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';

// Transformer para BIGINT → string (evita error al serializar JSON)
const BigIntToString = {
  to: (v?: number | string) => v,
  from: (v?: string | null) => v ?? '0',
};

@Entity({ name: 'archivos' })
export class Archivo {
  @PrimaryGeneratedColumn({ name: 'cod_archivo', type: 'int' })
  codArchivo!: number;

  // 👉 columna REAL en tu tabla
  @Column({ name: 'cod_usuario', type: 'int', nullable: true })
  codUsuario!: number | null;

  // (opcional) relación al Usuario usando la MISMA columna 'cod_usuario'
  // OJO: esto NO crea una columna nueva, solo reutiliza 'cod_usuario'
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  usuario?: Usuario | null;

  @Column({ name: 'ruta_archivo', type: 'varchar', length: 512 })
  rutaArchivo!: string;

  @Column({ name: 'nombre_original', type: 'varchar', length: 255 })
  nombreOriginal!: string;

  @Column({ name: 'tipo_contenido', type: 'varchar', length: 100 })
  tipoContenido!: string;

  @Column({ name: 'tamano_bytes', type: 'bigint', transformer: BigIntToString })
  tamanoBytes!: string;

  @Column({ name: 'area', type: 'varchar', length: 50, nullable: true })
  area!: string | null;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion!: Date;

  @Column({
    name: 'fecha_actualizacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fechaActualizacion!: Date;
}
