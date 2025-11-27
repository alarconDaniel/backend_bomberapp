import { S3StorageService } from './../../../models/storage/s3.storage';
import { Module } from '@nestjs/common';

// Token de inyección para abstraer el almacenamiento (S3 u otra cosa en el futuro)
export const STORAGE_PORT = 'STORAGE_PORT';

@Module({
  // Registramos un provider genérico que expone una interfaz de almacenamiento
  // detrás del token STORAGE_PORT, actualmente respaldado por S3StorageService.
  providers: [
    {
      provide: STORAGE_PORT,
      useFactory: () => new S3StorageService(),
    },
  ],
  // Otros módulos pueden inyectar STORAGE_PORT sin acoplarse a S3 directamente
  exports: [STORAGE_PORT],
})
export class StorageModule {}
