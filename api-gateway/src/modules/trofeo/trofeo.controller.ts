// src/modules/public/trofeo/trofeo.controller.ts

import { Controller, Param, Post, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { mapAxiosError } from '../../common/http-proxy.util';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

@ApiTags('Trofeo')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('trofeo')
/**
 * Controller that exposes trophy maintenance endpoints
 * and forwards requests to the retos-service.
 */
export class TrofeoController {
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

  // =======================================
  // POST /trofeo/recompute/:codTrofeo
  // =======================================
  @Post('recompute/:codTrofeo')
  @ApiOperation({
    summary: 'Recompute a single trophy by its identifier',
    description:
      'Triggers recalculation of the specified trophy only. Validation and logic are handled by retos-service.',
  })
  @ApiParam({
    name: 'codTrofeo',
    description: 'Trophy identifier to recompute',
    example: 3,
  })
  async recomputeOne(
    @Req() req: any,
    @Param('codTrofeo') codTrofeo: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl(`/trofeo/recompute/${codTrofeo}`),
          {},
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      // Expected shape:
      // { ok: boolean, codTrofeo?: number, error?: string }
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =======================================
  // POST /trofeo/recompute-all
  // =======================================
  @Post('recompute-all')
  @ApiOperation({
    summary: 'Recompute all assignable trophies',
    description:
      'Triggers recalculation of all trophies that match the configured rules (e.g. streak, speed, uploads).',
  })
  async recomputeAll(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/trofeo/recompute-all'),
          {},
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      // Expected shape:
      // { ok: true, count: number, items: Array<{ codTrofeo: number }> }
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
