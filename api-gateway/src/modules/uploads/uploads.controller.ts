// src/modules/public/uploads/uploads.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { mapAxiosError } from '../../common/http-proxy.util';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

// Keep this union in sync with the retos-service implementation.
type TipoArea = 'mantenimiento' | 'supervision';

@ApiTags('Uploads')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('uploads')
/**
 * Controller that exposes upload-related endpoints
 * and forwards requests to the retos-service, preserving authentication.
 */
export class UploadsController {
  /**
   * Base URL of retos-service used by this gateway.
   */
  private readonly retosBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.retosBaseUrl =
      this.configService.get<string>(RETOS_URL_CONFIG_KEY) ??
      DEFAULT_RETOS_BASE_URL;
  }

  /**
   * Builds authorization headers from the incoming request to forward
   * the bearer token to retos-service.
   */
  private buildAuthHeaders(req: any): { Authorization: string } {
    return {
      Authorization: req.headers['authorization'] || '',
    };
  }

  /**
   * Builds the full URL to the retos-service endpoint.
   */
  private buildRetosUrl(path: string): string {
    return `${this.retosBaseUrl}${path}`;
  }

  // ─────────────────────────────────────────────────────
  // GET /uploads/presign
  // ─────────────────────────────────────────────────────
  @Get('presign')
  @ApiOperation({
    summary: 'Generate a signed URL to upload a file (PUT) to object storage',
    description:
      'Returns a pre-signed URL that can be used by the client to upload a file directly to S3/MinIO.',
  })
  @ApiQuery({
    name: 'filename',
    required: true,
    description: 'Original filename to be stored',
    example: 'reporte-mantenimiento.pdf',
  })
  @ApiQuery({
    name: 'contentType',
    required: true,
    description: 'MIME type of the file to be uploaded',
    example: 'application/pdf',
  })
  @ApiQuery({
    name: 'codUsuario',
    required: true,
    description: 'User identifier that owns the upload',
    example: '123',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description:
      'Optional logical area for the file (affects storage path). Allowed values: mantenimiento | supervision',
    enum: ['mantenimiento', 'supervision'],
  })
  async presign(
    @Req() req: any,
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
    @Query('codUsuario') codUsuario: string,
    @Query('tipo') tipo?: string,
  ): Promise<unknown> {
    try {
      const params = {
        filename,
        contentType,
        codUsuario,
        tipo,
      };

      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/uploads/presign'), {
          params,
          headers: this.buildAuthHeaders(req),
        }),
      );

      // Expected: signed URL + metadata required by the client to upload.
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ─────────────────────────────────────────────────────
  // GET /uploads/list
  // ─────────────────────────────────────────────────────
  @Get('list')
  @ApiOperation({
    summary: 'List uploaded files stored in the database',
    description:
      'Returns paginated records of files stored in the system, optionally filtered by user.',
  })
  @ApiQuery({
    name: 'codUsuario',
    required: false,
    description: 'Optional user identifier to filter by owner',
    example: '123',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Maximum number of records to return (default 50, max 100)',
    example: '50',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of records to skip for pagination',
    example: '0',
  })
  async list(
    @Req() req: any,
    @Query('codUsuario') codUsuario?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ): Promise<unknown> {
    try {
      const params = {
        codUsuario,
        take,
        skip,
      };

      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/uploads/list'), {
          params,
          headers: this.buildAuthHeaders(req),
        }),
      );

      // Expected: { total: number, rows: any[] }
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ─────────────────────────────────────────────────────
  // GET /uploads/download-presign
  // ─────────────────────────────────────────────────────
  @Get('download-presign')
  @ApiOperation({
    summary: 'Generate a signed URL to download a file',
    description:
      'Returns a time-limited signed URL that can be used to download an object from S3/MinIO.',
  })
  @ApiQuery({
    name: 'key',
    required: true,
    description: 'Object storage key/path identifying the file',
    example: 'mantenimiento/123/reportes/reporte-mantenimiento.pdf',
  })
  async downloadPresign(
    @Req() req: any,
    @Query('key') key: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/uploads/download-presign'),
          {
            params: { key },
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      // Expected: { url: string, expiresIn: number, ... }
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ─────────────────────────────────────────────────────
  // DELETE /uploads?key=...
  // ─────────────────────────────────────────────────────
  @Delete()
  @ApiOperation({
    summary: 'Delete a file from object storage and database',
    description:
      'Removes the file from S3/MinIO and attempts to remove the associated database record.',
  })
  @ApiQuery({
    name: 'key',
    required: true,
    description: 'Object storage key/path identifying the file to delete',
    example: 'mantenimiento/123/reportes/reporte-mantenimiento.pdf',
  })
  async remove(
    @Req() req: any,
    @Query('key') key: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(this.buildRetosUrl('/uploads'), {
          params: { key },
          headers: this.buildAuthHeaders(req),
        }),
      );

      // Expected: { deleted: boolean, key: string }
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ─────────────────────────────────────────────────────
  // POST /uploads/complete
  // ─────────────────────────────────────────────────────
  @Post('complete')
  @ApiOperation({
    summary: 'Complete an upload and register/update its database record',
    description:
      'Called after a successful upload to object storage to persist or update the corresponding database record.',
  })
  @ApiBody({
    description:
      'Information about the completed upload, including storage key, file metadata and optional owner/area.',
    schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'Object storage key/path of the uploaded file',
          example: 'mantenimiento/123/reportes/reporte-mantenimiento.pdf',
        },
        filename: {
          type: 'string',
          nullable: true,
          description: 'Original filename as uploaded by the user',
          example: 'reporte-mantenimiento.pdf',
        },
        contentType: {
          type: 'string',
          nullable: true,
          description: 'MIME type of the uploaded file',
          example: 'application/pdf',
        },
        size: {
          type: 'number',
          nullable: true,
          description: 'Size of the file in bytes',
          example: 1048576,
        },
        etag: {
          type: 'string',
          nullable: true,
          description: 'Storage ETag or version identifier',
          example: '"9b2cf535f27731c974343645a3985328"',
        },
        codUsuario: {
          type: 'number',
          nullable: true,
          description: 'User identifier associated with this file',
          example: 123,
        },
        tipo: {
          type: 'string',
          nullable: true,
          description:
            'Optional logical area for the file. Allowed values: "mantenimiento" | "supervision".',
          enum: ['mantenimiento', 'supervision'],
        },
      },
      required: ['key'],
    },
  })
  async complete(
    @Req() req: any,
    @Body()
    body: {
      key: string;
      filename?: string;
      contentType?: string;
      size?: number;
      etag?: string | null;
      codUsuario?: number;
      tipo?: TipoArea;
    },
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/uploads/complete'),
          body,
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      // Expected: { ok: true, archivo: { ... } }
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ─────────────────────────────────────────────────────
  // GET /uploads/file?key=...
  // ─────────────────────────────────────────────────────
  @Get('file')
  @ApiOperation({
    summary: 'Stream a file directly through the gateway',
    description:
      'Streams the file from retos-service (which in turn streams from S3/MinIO) to the client, preserving headers like Content-Type and Content-Disposition.',
  })
  @ApiQuery({
    name: 'key',
    required: true,
    description: 'Object storage key/path identifying the file to stream',
    example: 'mantenimiento/123/reportes/reporte-mantenimiento.pdf',
  })
  async streamFile(
    @Req() req: any,
    @Query('key') key: string,
    @Res() res: any,
  ): Promise<void> {
    try {
      const axiosResponse = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/uploads/file'), {
          params: { key },
          headers: this.buildAuthHeaders(req),
          responseType: 'stream' as any,
        }),
      );

      const contentType =
        axiosResponse.headers['content-type'] ?? 'application/octet-stream';
      const contentLength = axiosResponse.headers['content-length'];
      const contentDisposition =
        axiosResponse.headers['content-disposition'];

      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      if (contentDisposition) {
        res.setHeader('Content-Disposition', contentDisposition);
      }

      (axiosResponse.data as NodeJS.ReadableStream).pipe(res);
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
