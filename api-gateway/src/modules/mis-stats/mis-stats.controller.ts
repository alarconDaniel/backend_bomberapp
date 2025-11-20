// src/modules/mis-stats/mis-stats.controller.ts

import { Controller, Get, Post, Req } from '@nestjs/common';
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

@ApiTags('Mis Stats')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('mis-stats')
/**
 * Controller that exposes user statistics endpoints
 * and forwards requests to the retos-service.
 */
export class MisStatsController {
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
  // GET /mis-stats/listar
  // ===========================
  @Get('listar')
  @ApiOperation({
    summary: 'List current user statistics',
    description:
      'Returns the statistics associated with the currently authenticated user. The user ID is resolved from the JWT in retos-service.',
  })
  async listarStats(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/mis-stats/listar'),
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
  // POST /mis-stats/test-reset
  // ===========================
  @Post('test-reset')
  @ApiOperation({
    summary: 'Trigger the streak reset cron manually (testing only)',
    description:
      'Invokes the cron-like logic that resets user streaks if there was no activity yesterday. Intended for diagnostics/testing.',
  })
  async testReset(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/mis-stats/test-reset'),
          {},
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
