import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

type PresignArgs = { filename: string; contentType: string; codUsuario: number };

@Injectable()
export class UploadsService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    // lee credenciales desde env (clave con \n escapadas en Windows)
    const privateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    this.storage = new Storage({
      projectId: process.env.GCLOUD_PROJECT,
      credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: privateKey,
      },
    });

    this.bucketName = process.env.GCS_BUCKET!;
    if (!this.bucketName) {
      throw new Error('Falta env GCS_BUCKET');
    }
  }

  async createSignedUploadUrl({ filename, contentType, codUsuario }: PresignArgs) {
    const objectKey = `usuarios/${codUsuario}/${Date.now()}-${filename}`;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(objectKey);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',                // subir (PUT)
      expires: Date.now() + 5 * 60 * 1000, // 5 min
      contentType,
    });

    // opcional: URL pública de lectura si luego la haces public o con otra firma
    const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${encodeURIComponent(objectKey)}`;

    return { provider: 'gcs', signedUrl, objectKey, contentType, publicUrl };
  }
}
