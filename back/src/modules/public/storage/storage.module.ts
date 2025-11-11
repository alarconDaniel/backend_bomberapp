import { S3StorageService } from './../../../models/storage/s3.storage';
import { Module } from '@nestjs/common';

export const STORAGE_PORT = 'STORAGE_PORT';

@Module({
  providers: [{ provide: STORAGE_PORT, useFactory: () => new S3StorageService() }],
  exports: [STORAGE_PORT],
})
export class StorageModule {}
