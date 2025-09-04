import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type PresignArgs = { filename: string; contentType: string; codUsuario: number };

@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly expiresIn: number;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    const region = process.env.S3_REGION || 'us-east-1';
    const bucket = process.env.S3_BUCKET;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error(
        'Faltan variables S3_ENDPOINT / S3_ACCESS_KEY / S3_SECRET_KEY / S3_BUCKET',
      );
    }

    this.s3 = new S3Client({
      region,
      endpoint, // ej: http://localhost:9000
      forcePathStyle: true, // necesario para MinIO
      credentials: { accessKeyId, secretAccessKey },
    });

    this.bucket = bucket;
    this.expiresIn = Number(process.env.S3_PRESIGN_TTL_SEC ?? 300); // 5 min
  }

  // Presign para SUBIR (PUT)
  async createSignedUploadUrl({ filename, contentType, codUsuario }: PresignArgs) {
    const Key = `usuarios/${codUsuario}/${Date.now()}-${filename}`;

    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.s3, cmd, {
      expiresIn: this.expiresIn,
    });

    const publicBase = process.env.S3_PUBLIC_BASE ?? process.env.S3_ENDPOINT!;
    const publicUrl = `${publicBase}/${this.bucket}/${encodeURIComponent(Key)}`;

    return {
      provider: 's3',
      signedUrl, // URL para hacer el PUT
      objectKey: Key, // ruta dentro del bucket
      contentType,
      expiresIn: this.expiresIn,
      publicUrl, // lectura directa si tu MinIO lo permite
    };
  }

  // Presign para DESCARGAR (GET temporal)
  async createSignedDownloadUrl(key: string) {
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const url = await getSignedUrl(this.s3, cmd, { expiresIn: this.expiresIn });
    return { url, expiresIn: this.expiresIn };
  }

  // Listar objetos por usuario (prefijo usuarios/{codUsuario}/)
  async listByUser(codUsuario: number) {
    const Prefix = `usuarios/${codUsuario}/`;
    const cmd = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix,
    });
    const out = await this.s3.send(cmd);
    const items =
      (out.Contents ?? []).map((o) => ({
        key: o.Key,
        size: o.Size,
        lastModified: o.LastModified,
        etag: o.ETag,
      })) || [];
    return { prefix: Prefix, items };
  }

  // Borrar un objeto
  async deleteObject(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return { deleted: key };
  }
}
