// src/modules/public/uploads/uploads.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client, PutObjectCommand, GetObjectCommand,
  ListObjectsV2Command, DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type TipoArea = 'mantenimiento' | 'supervision';

type PresignArgs = {
  filename: string;
  contentType: string;
  codUsuario: number;
  tipo?: TipoArea;               // opcional: subcarpeta por área
};

@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly expiresIn: number;
  private readonly publicBase?: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    const region = process.env.S3_REGION || 'us-east-1';
    const bucket = process.env.S3_BUCKET;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new InternalServerErrorException(
        'Faltan env S3_ENDPOINT / S3_ACCESS_KEY / S3_SECRET_KEY / S3_BUCKET',
      );
    }

    this.s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: true, // MinIO
      credentials: { accessKeyId, secretAccessKey },
    });

    this.bucket = bucket!;
    this.expiresIn = Number(process.env.S3_PRESIGN_TTL_SEC ?? 300);
    this.publicBase = process.env.S3_PUBLIC_BASE;
  }

  private buildUserKey(codUsuario: number, filename: string, tipo?: TipoArea) {
    const safe = filename.replace(/[/\\]/g, '_');
    const areaSeg = tipo ? `/${tipo}` : '';
    return `usuarios/${codUsuario}${areaSeg}/${Date.now()}-${safe}`;
  }

  async createSignedUploadUrl({ filename, contentType, codUsuario, tipo }: PresignArgs) {
    const Key = this.buildUserKey(codUsuario, filename, tipo);

    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.s3, cmd, { expiresIn: this.expiresIn });

    const publicUrlBase = this.publicBase || process.env.S3_ENDPOINT!;
    const publicUrl = `${publicUrlBase}/${this.bucket}/${encodeURIComponent(Key)}`;

    return {
      provider: 's3' as const,
      signedUrl,
      objectKey: Key,
      contentType,
      expiresIn: this.expiresIn,
      publicUrl,
    };
  }

  async createSignedDownloadUrl(key: string) {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.s3, cmd, { expiresIn: this.expiresIn });
    return { url, expiresIn: this.expiresIn };
  }

  async listByUser(codUsuario: number) {
    const Prefix = `usuarios/${codUsuario}/`;
    const cmd = new ListObjectsV2Command({ Bucket: this.bucket, Prefix });
    const res = await this.s3.send(cmd);

    const items = (res.Contents || [])
      .filter(x => !!x.Key && x.Key !== Prefix)
      .map(x => ({
        key: x.Key!,
        size: x.Size ?? 0,
        lastModified: x.LastModified?.toISOString?.() ?? new Date().toISOString(),
      }));

    return { prefix: Prefix, items };
  }

  async deleteObject(key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    return { deleted: true, key };
  }
}
