// src/storage/storage.port.ts

/**
 * Parámetros para generar una URL prefirmada de subida (PUT) a S3/MinIO.
 *
 * Se usa como contrato genérico para cualquier implementación de StoragePort
 * que trabaje con almacenamiento compatible con S3.
 */
export interface PresignPutParams {
  /** Nombre del bucket donde se subirá el archivo. */
  bucket: string;

  /** Clave/ruta del objeto dentro del bucket (p.ej. "reportes/123/archivo.pdf"). */
  key: string;

  /** Content-Type esperado del archivo a subir. */
  contentType: string;

  /** Tiempo de expiración de la URL prefirmada en segundos (por defecto ~300s en la impl). */
  expiresIn?: number; // segundos
}

/**
 * Resultado mínimo esperado de un HEAD sobre un objeto en almacenamiento S3-compatible.
 */
export interface HeadResult {
  /** Tamaño del archivo en bytes (si el servidor lo reporta). */
  contentLength?: number;

  /** Tipo MIME del archivo almacenado. */
  contentType?: string;

  /** ETag reportado por el almacenamiento (útil para cache/validación). */
  eTag?: string | null;

  /** Fecha de última modificación del objeto. */
  lastModified?: Date | null;
}

/**
 * Puerto/contrato de almacenamiento genérico basado en S3.
 *
 * Implementaciones típicas:
 * - Adaptador a AWS S3.
 * - Adaptador a MinIO u otros servicios S3-compatibles.
 *
 * La capa de negocio solo depende de esta interfaz, no del SDK concreto.
 */
export interface StoragePort {
  /**
   * Genera una URL prefirmada para subir un archivo vía HTTP PUT.
   */
  presignPut(params: PresignPutParams): Promise<string>;

  /**
   * Calcula una URL pública de acceso al objeto (según la estrategia del proveedor).
   */
  publicUrl(bucket: string, key: string): string;

  /**
   * Recupera metadatos del objeto sin descargar su contenido (HEAD).
   */
  headObject(bucket: string, key: string): Promise<HeadResult>;

  /**
   * Elimina un objeto del almacenamiento.
   */
  deleteObject(bucket: string, key: string): Promise<void>;
}
