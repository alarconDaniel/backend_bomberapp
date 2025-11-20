// src/modules/catalogos/catalogos.controller.ts

import { Controller, Get, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { mapAxiosError } from '../../common/http-proxy.util';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

@ApiTags('Catálogos')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('catalogos')
/**
 * Gateway controller that proxies "catalogos" endpoints
 * to the retos-service, preserving authentication and request context.
 */
export class CatalogosController {
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
  // GET /catalogos/cargos
  // ===========================
  @Get('cargos')
  @ApiOperation({
    summary: 'List job positions (cargos) catalog',
    description:
      'Returns all available job positions ordered alphabetically by name. The data is proxied from retos-service.',
  })
  async cargos(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/catalogos/cargos'),
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      // Expected shape: [{ id: number, nombre: string }]
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
