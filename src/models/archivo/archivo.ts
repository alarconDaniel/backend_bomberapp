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

// Transformer para BIGINT → string (evita problemas al serializar/parsear en JS)
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

  // FK directa al usuario dueño del archivo (nullable por si queda huérfano)
  @Column({ name: 'cod_usuario', type: 'int', nullable: true })
  codUsuario!: number | null;

  // Relación ManyToOne al Usuario usando la misma columna 'cod_usuario'
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  usuario?: Usuario | null;

  /**
   * === Campos legacy (no romper compatibilidad) ===
   * Para archivos antiguos en Drive se guardaba una "ruta".
   * Para S3/MinIO la referencia real es bucket + keyPath.
   */
  @Column({
    name: 'ruta_archivo',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  rutaArchivo: string | null;

  // Nombre original del archivo tal como lo subió el usuario
  @Column({ name: 'nombre_original', type: 'varchar', length: 255 })
  nombreOriginal!: string;

  // Área / dominio funcional al que pertenece el archivo (ej: "retos", "reportes", etc.)
  @Column({ name: 'area', type: 'varchar', length: 32, nullable: true })
  area?: string | null;

  // MIME type (image/png, application/pdf, ...)
  @Column({ name: 'tipo_contenido', type: 'varchar', length: 100 })
  tipoContenido!: string;

  // Tamaño en bytes (como string para no reventar el rango numérico en JS)
  @Column({ name: 'tamano_bytes', type: 'bigint', transformer: BigIntToString })
  tamanoBytes!: string;

  // Marca de tiempo de creación del registro de archivo
  @Column({
    name: 'fecha_creacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion!: Date;

  // Marca de tiempo de última actualización (se actualiza automáticamente)
  @Column({
    name: 'fecha_actualizacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fechaActualizacion!: Date;

  /**
   * === Nuevos campos "portables" para S3/MinIO y compat con Drive ===
   * - provider: 's3' (nuevo) o 'drive' (legacy)
   * - bucket + keyPath: identificación única en storage tipo S3
   * - extId: id de archivo de Drive (legacy)
   * - storageEtag / checksumSha256 / storageCreatedAt: metadatos para integridad y auditoría
   */
  @Column({
    name: 'provider',
    type: 'enum',
    enum: ['s3', 'drive'],
    default: 's3',
  })
  provider!: ArchivoProvider;

  // Nombre del bucket en S3/MinIO donde vive el archivo
  @Column({ name: 'bucket', type: 'varchar', length: 128, nullable: true })
  bucket!: string | null;

  // Ruta/clave del objeto dentro del bucket
  @Column({ name: 'key_path', type: 'varchar', length: 512, nullable: true })
  keyPath!: string | null;

  // Id externo para integraciones tipo Google Drive
  @Column({ name: 'ext_id', type: 'varchar', length: 256, nullable: true })
  extId!: string | null;

  // ETag devuelto por el storage (útil para cache y verificación de cambios)
  @Column({
    name: 'storage_etag',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  storageEtag!: string | null;

  // SHA-256 binario calculado del contenido (32 bytes) para integridad fuerte
  @Column({
    name: 'checksum_sha256',
    type: 'binary',
    length: 32,
    nullable: true,
  })
  checksumSha256!: Buffer | null;

  // Fecha de creación en el storage (no solo en la BD local)
  @Column({ name: 'storage_created_at', type: 'datetime', nullable: true })
  storageCreatedAt!: Date | null;
}
