// src/storage/storage.port.ts

export interface PresignPutParams {
    bucket: string;
    key: string;
    contentType: string;
    expiresIn?: number; // segundos
  }
  
  export interface HeadResult {
    contentLength?: number;
    contentType?: string;
    eTag?: string | null;
    lastModified?: Date | null;
  }
  
  export interface StoragePort {
    presignPut(params: PresignPutParams): Promise<string>;
    publicUrl(bucket: string, key: string): string;
    headObject(bucket: string, key: string): Promise<HeadResult>;
    deleteObject(bucket: string, key: string): Promise<void>;
  }
  