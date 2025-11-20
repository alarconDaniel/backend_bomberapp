// src/archivos/archivos.gateway.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { mapAxiosError } from '../../common/http-proxy.util';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

const ARCHIVO_TIPO_ENUM = ['mantenimiento', 'supervision'] as const;
type ArchivoTipo = (typeof ARCHIVO_TIPO_ENUM)[number];

@ApiTags('Archivos')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('archivos')
/**
 * Gateway controller that proxies "archivos" requests
 * to the retos-service, preserving authentication and request context.
 */
export class ArchivosGatewayController {
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

  // ===========================
  // GET /archivos/ping-drive
  // ===========================
  @Get('ping-drive')
  @ApiOperation({
    summary: 'Ping storage backend for current user (health check)',
  })
  async pingStorage(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/archivos/ping-drive'), {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // GET /archivos/listar
  // ===========================
  @Get('listar')
  @ApiOperation({ summary: 'List files for a user' })
  @ApiQuery({
    name: 'codUsuario',
    required: false,
    type: Number,
    description: 'Optional user code; if omitted, it is inferred from JWT',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Max number of items to fetch (default: 20, max: 100)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of items to skip for pagination',
  })
  async listarArchivos(
    @Req() req: any,
    @Query('codUsuario') codUsuario?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string | undefined> = {
        codUsuario,
        take,
        skip,
      };

      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/archivos/listar'), {
          params,
          headers: this.buildAuthHeaders(req),
        }),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // GET /archivos/listar-por-tipo
  // ===========================
  @Get('listar-por-tipo')
  @ApiOperation({
    summary:
      'List files by logical type (mantenimiento / supervision) using S3 prefix',
  })
  @ApiQuery({
    name: 'tipo',
    required: true,
    enum: ARCHIVO_TIPO_ENUM,
  })
  @ApiQuery({
    name: 'pageToken',
    required: false,
    type: String,
    description: 'Optional pagination token for S3 listing',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Page size (default: 20, max: 100)',
  })
  async listarPorTipo(
    @Req() req: any,
    @Query('tipo') tipo: ArchivoTipo,
    @Query('pageToken') pageToken?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string | undefined> = {
        tipo,
        pageToken,
        pageSize,
      };

      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/archivos/listar-por-tipo'), {
          params,
          headers: this.buildAuthHeaders(req),
        }),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // GET /archivos/url-descarga
  // ===========================
  @Get('url-descarga')
  @ApiOperation({
    summary: 'Generate a signed download URL for a stored file',
  })
  @ApiQuery({
    name: 'path',
    required: true,
    type: String,
    description: 'Storage path of the file',
  })
  async generarUrlDescarga(
    @Req() req: any,
    @Query('path') path: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/archivos/url-descarga'), {
          params: { path },
          headers: this.buildAuthHeaders(req),
        }),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // POST /archivos/confirmar-tamano
  // ===========================
  @Post('confirmar-tamano')
  @ApiOperation({
    summary: 'Confirm file size after upload to storage backend',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Storage path of the file to validate',
        },
      },
      required: ['path'],
    },
  })
  async confirmarTamano(
    @Req() req: any,
    @Body('path') path: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/archivos/confirmar-tamano'),
          { path },
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // POST /archivos/subir
  // ===========================
  @Post('subir')
  @ApiOperation({
    summary:
      'Upload a file (multipart/form-data) and proxy it to retos-service',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'File upload payload; the gateway forwards the raw multipart stream',
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
          description: 'File content',
        },
        codUsuario: {
          type: 'number',
          nullable: true,
          description:
            'Optional user code; if omitted, it is inferred from JWT in retos-service',
        },
        tipo: {
          type: 'string',
          enum: ['mantenimiento', 'supervision'],
          nullable: true,
          description: 'Logical type: mantenimiento | supervision',
        },
        carpeta: {
          type: 'string',
          nullable: true,
          description: 'Logical subfolder in storage backend',
        },
        name: {
          type: 'string',
          nullable: true,
          description: 'Target filename in storage backend',
        },
        overwrite: {
          type: 'string',
          nullable: true,
          description:
            'Whether to overwrite existing file ("true" / "false", default: true)',
        },
      },
      required: ['archivo'],
    },
  })
  /**
   * Note:
   * This gateway method does NOT parse the multipart file.
   * It forwards the raw incoming request stream to retos-service,
   * preserving the original Content-Type (including boundary).
   */
  async subirArchivo(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/archivos/subir'),
          req, // forward raw request stream
          {
            headers: {
              ...this.buildAuthHeaders(req),
              // Preserve multipart boundary and any other content-type details
              'content-type': req.headers['content-type'] || '',
            },
            // Allow large payloads (backend already enforces its own limit)
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          },
        ),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // DELETE /archivos/eliminar
  // ===========================
  @Delete('eliminar')
  @ApiOperation({
    summary: 'Delete a file (DELETE variant)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codUsuario: {
          type: 'number',
          nullable: true,
          description:
            'Optional user code; if omitted, it is inferred from JWT',
        },
        path: {
          type: 'string',
          description: 'Storage path of the file to delete',
        },
      },
      required: ['path'],
    },
  })
  async eliminarArchivo(
    @Req() req: any,
    @Body() body: { codUsuario?: number; path: string },
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(this.buildRetosUrl('/archivos/eliminar'), {
          data: body,
          headers: this.buildAuthHeaders(req),
        }),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // POST /archivos/eliminar
  // ===========================
  @Post('eliminar')
  @ApiOperation({
    summary: 'Delete a file (POST variant, same semantics as DELETE)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codUsuario: {
          type: 'number',
          nullable: true,
          description:
            'Optional user code; if omitted, it is inferred from JWT',
        },
        path: {
          type: 'string',
          description: 'Storage path of the file to delete',
        },
      },
      required: ['path'],
    },
  })
  async eliminarArchivoPost(
    @Req() req: any,
    @Body() body: { codUsuario?: number; path: string },
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/archivos/eliminar'),
          body,
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
