// src/storage/s3.storage.ts
import {
    PutObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
  } from '@aws-sdk/client-s3';
  import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
  import { makeS3Client } from './s3.client';
  import { StoragePort, PresignPutParams, HeadResult } from './storage.port';
  
  export class S3StorageService implements StoragePort {
    private s3 = makeS3Client();
  
    async presignPut({ bucket, key, contentType, expiresIn = 300 }: PresignPutParams): Promise<string> {
      const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType || 'application/octet-stream' });
      return getSignedUrl(this.s3, cmd, { expiresIn });
    }
  
    publicUrl(bucket: string, key: string): string {
      const ep = (process.env.S3_ENDPOINT || '').replace(/\/+$/, '');
      if (ep) return `${ep}/${bucket}/${encodeURI(key)}`; // path-style
      const region = process.env.S3_REGION || 'us-east-1';
      return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURI(key)}`;
    }
  
    async headObject(bucket: string, key: string): Promise<HeadResult> {
      const out = await this.s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return {
        contentLength: out.ContentLength,
        contentType: out.ContentType,
        eTag: out.ETag ?? null,
        lastModified: out.LastModified ?? null,
      };
    }
  
    async deleteObject(bucket: string, key: string): Promise<void> {
      await this.s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    }
  }
  