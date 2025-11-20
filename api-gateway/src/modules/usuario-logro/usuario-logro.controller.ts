// src/modules/public/usuario-logro/usuario-logro.controller.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { mapAxiosError } from '../../common/http-proxy.util';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

@ApiTags('Mis Logros')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('mis-logros')
/**
 * Controller that exposes "mis-logros" endpoints
 * and forwards requests to the retos-service, preserving authentication.
 */
export class UsuarioLogroController {
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
  // GET /mis-logros/ultimos
  // ===========================
  @Get('ultimos')
  @ApiOperation({
    summary: 'Get the latest achievements for the current user',
    description:
      'Returns the most recent achievements obtained by the authenticated user. The number of items can be limited with the "limit" query parameter.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description:
      'Maximum number of achievements to return (clamped in the service, default is usually 2, max 10).',
    example: '5',
  })
  async ultimos(
    @Req() req: any,
    @Query('limit') limit?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string> = {};
      if (limit !== undefined) {
        params.limit = limit;
      }

      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/mis-logros/ultimos'),
          {
            params,
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      // Expected: UsuarioLogroService.ultimosDelUsuario(codUsuario, n)
      // returns an array of the latest achievements.
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // GET /mis-logros/todos
  // ===========================
  @Get('todos')
  @ApiOperation({
    summary: 'Get all achievements with status for the current user',
    description:
      'Returns all achievements along with the current user state (earned or not, progress, etc.).',
  })
  async todos(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/mis-logros/todos'),
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      // Expected: UsuarioLogroService.todosConEstado(codUsuario)
      // returns a list of achievements + user status.
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
