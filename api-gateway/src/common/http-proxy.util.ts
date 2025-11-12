// src/common/http-proxy.util.ts
import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';

export function mapAxiosError(e: any): never {
  if (e.isAxiosError) {
    const ax = e as AxiosError;
    const status = ax.response?.status ?? 500;
    const data = ax.response?.data ?? ax.message;
    throw new HttpException(data as any, status);
  }
  throw e;
}
