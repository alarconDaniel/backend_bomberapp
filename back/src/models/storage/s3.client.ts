import { S3Client } from '@aws-sdk/client-s3';

export function makeS3Client() {
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const forcePathStyle = !!endpoint && !endpoint.includes('amazonaws.com'); // MinIO/Spaces/B2/R2

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
