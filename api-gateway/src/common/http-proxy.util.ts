// src/common/http-proxy.util.ts
import { AxiosError, isAxiosError } from 'axios';
import { HttpException } from '@nestjs/common';

const DEFAULT_PROXY_ERROR_STATUS = 500;

/**
 * Maps an Axios error into a Nest HttpException so that upstream HTTP clients
 * receive a meaningful status code and payload.
 *
 * If the error is not an AxiosError, it is rethrown unchanged.
 */
export function mapAxiosError(error: unknown): never {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status ?? DEFAULT_PROXY_ERROR_STATUS;
    const responseBody =
      (axiosError.response?.data ?? axiosError.message) as string | Record<string, unknown>;

    throw new HttpException(responseBody, statusCode);
  }

  // Non-Axios errors are rethrown so they can be handled by global filters.
  throw error;
}
