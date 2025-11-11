// src/models/archivo/archivo.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from '../usuario/usuario';

// Transformer para BIGINT → string (evita error al serializar JSON)
const BigIntToString = {
  to: (v?: number | string) => v,
  from: (v?: string | null) => v ?? '0',
};

export type ArchivoProvider = 's3' | 'drive';

@Entity({ name: 'archivos' })
@Index('idx_archivo_provider', ['provider'])
@Index('idx_archivo_s3_obj', ['provider', 'bucket', 'keyPath'])
@Index('idx_archivo_drive_extid', ['extId'])
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

  /**
   * === Campos legacy (no romper) ===
   * Para archivos antiguos en Drive tal vez guardabas una "ruta".
   * La mantenemos para compatibilidad. Para S3/MinIO usa bucket + keyPath.
   */
  // models/archivo/archivo.ts
  @Column({ name: 'ruta_archivo', type: 'varchar', nullable: true, default: null })
  rutaArchivo: string | null;

  @Column({ name: 'nombre_original', type: 'varchar', length: 255 })
  nombreOriginal!: string;

  @Column({ name: 'area', type: 'varchar', length: 32, nullable: true })
  area?: string | null;
  
  // MIME
  @Column({ name: 'tipo_contenido', type: 'varchar', length: 100 })
  tipoContenido!: string;

  // Tamaño en bytes
  @Column({ name: 'tamano_bytes', type: 'bigint', transformer: BigIntToString })
  tamanoBytes!: string;

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

  /**
   * === Nuevos campos portables para S3/MinIO y compat con Drive ===
   * - provider: 's3' (nuevo) o 'drive' (legacy)
   * - bucket + keyPath: identificación del objeto en S3/MinIO
   * - extId: id de archivo de Drive (legacy)
   * - storageEtag / checksumSha256 / storageCreatedAt: metadatos útiles
   */
  @Column({
    name: 'provider',
    type: 'enum',
    enum: ['s3', 'drive'],
    default: 's3',
  })
  provider!: ArchivoProvider;

  @Column({ name: 'bucket', type: 'varchar', length: 128, nullable: true })
  bucket!: string | null;

  @Column({ name: 'key_path', type: 'varchar', length: 512, nullable: true })
  keyPath!: string | null;

  // Id externo (Drive)
  @Column({ name: 'ext_id', type: 'varchar', length: 256, nullable: true })
  extId!: string | null;

  // ETag devuelto por S3/MinIO (útil para integridad/cache)
  @Column({ name: 'storage_etag', type: 'varchar', length: 64, nullable: true })
  storageEtag!: string | null;

  // SHA-256 binario de tu lado (si lo calculas) — 32 bytes
  @Column({ name: 'checksum_sha256', type: 'binary', length: 32, nullable: true })
  checksumSha256!: Buffer | null;

  // Fecha de creación en el storage (si la capturas)
  @Column({ name: 'storage_created_at', type: 'datetime', nullable: true })
  storageCreatedAt!: Date | null;
}
