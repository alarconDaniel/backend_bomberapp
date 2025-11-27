// src/storage/s3.storage.ts
import {
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { makeS3Client } from './s3.client';
import { StoragePort, PresignPutParams, HeadResult } from './storage.port';

/**
 * Adaptador de almacenamiento S3-compatible.
 *
 * Importante:
 * - Usa el cliente creado en `makeS3Client`, que ya está preparado para MinIO
 *   (endpoint custom + path-style cuando S3_ENDPOINT no es amazonaws.com).
 * - Se expone:
 *   - URL prefirmada para subidas (PUT).
 *   - URL pública calculada (útil para MinIO local y S3 clásico).
 *   - headObject para inspeccionar metadatos.
 *   - deleteObject para borrar archivos.
 */
export class S3StorageService implements StoragePort {
  /** Cliente S3 compartido por la instancia (configurado vía env). */
  private s3 = makeS3Client();

  /**
   * Genera una URL prefirmada para subir un archivo (PUT).
   *
   * @param bucket  Nombre del bucket destino.
   * @param key     Ruta/clave dentro del bucket (p.ej. "retos/123/archivo.pdf").
   * @param contentType  Content-Type esperado (por defecto application/octet-stream).
   * @param expiresIn    Tiempo de validez en segundos (por defecto 300s).
   *
   * Nota:
   * - El cliente ya lleva la firma correcta tanto para MinIO local
   *   como para S3, según la config de `makeS3Client`.
   */
  async presignPut({ bucket, key, contentType, expiresIn = 300 }: PresignPutParams): Promise<string> {
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    });
    return getSignedUrl(this.s3, cmd, { expiresIn });
  }

  /**
   * Construye una URL pública para acceder al objeto.
   *
   * Comportamiento:
   * - Si S3_ENDPOINT está definido (caso típico MinIO local),
   *   se usa path-style:  `${endpoint}/${bucket}/${key}`.
   * - Si no hay endpoint, se asume AWS S3 clásico:
   *   `https://${bucket}.s3.${region}.amazonaws.com/${key}`.
   *
   * Ojo:
   * - Para que la URL funcione en MinIO, el bucket debe existir
   *   y el servidor aceptar acceso público (o estar detrás del backend).
   */
  publicUrl(bucket: string, key: string): string {
    const ep = (process.env.S3_ENDPOINT || '').replace(/\/+$/, '');
    if (ep) return `${ep}/${bucket}/${encodeURI(key)}`; // path-style para MinIO / S3-compatible

    const region = process.env.S3_REGION || 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURI(key)}`;
  }

  /**
   * Hace un HEAD del objeto para obtener metadatos sin descargarlo.
   *
   * Devuelve:
   * - contentLength: tamaño en bytes (o undefined si el servidor no lo envía).
   * - contentType:  tipo MIME si está configurado.
   * - eTag:         ETag reportado por el servidor.
   * - lastModified: fecha de última modificación.
   */
  async headObject(bucket: string, key: string): Promise<HeadResult> {
    const out = await this.s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return {
      contentLength: out.ContentLength,
      contentType: out.ContentType,
      eTag: out.ETag ?? null,
      lastModified: out.LastModified ?? null,
    };
  }

  /**
   * Elimina un objeto del bucket.
   *
   * No retorna nada; si hay problema de permisos o el objeto no existe,
   * el cliente S3 lanzará un error que debe manejar quien consuma el servicio.
   */
  async deleteObject(bucket: string, key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
}
