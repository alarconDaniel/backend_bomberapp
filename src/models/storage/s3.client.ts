import { S3Client } from '@aws-sdk/client-s3';

/**
 * Factoría de cliente S3.
 *
 * Lee configuración desde variables de entorno:
 * - S3_ENDPOINT → si está presente y NO contiene "amazonaws.com"
 *   se asume proveedor tipo MinIO y se activa `forcePathStyle`.
 * - S3_REGION   → región del bucket (por defecto `'auto'`).
 * - S3_ACCESS_KEY / S3_SECRET_KEY → credenciales del bucket.
 *
 */

export function makeS3Client() {
  const endpoint = process.env.S3_ENDPOINT?.trim();

  const forcePathStyle = !!endpoint && !endpoint.includes('amazonaws.com');

  return new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: endpoint || undefined,
    forcePathStyle,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
  });
}
