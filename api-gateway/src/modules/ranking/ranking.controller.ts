// src/modules/public/ranking/ranking.controller.ts

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

@ApiTags('Ranking')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('ranking')
/**
 * Controller that exposes ranking endpoints
 * and forwards requests to the retos-service, preserving authentication.
 */
export class RankingController {
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
  // GET /ranking/resumen
  // ===========================
  @Get('resumen')
  @ApiOperation({
    summary: 'Get ranking summary for the current user',
    description:
      'Returns global ranking, current user position, trophies and a motivational message based on their position.',
  })
  async resumen(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/ranking/resumen'),
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      /*
        Expected response shape (from retos-service):

        {
          top: Array<any>;        // top XP users (e.g. top 5)
          me: {
            position: number;
            // ...other fields about the current user in ranking
          };
          mensaje: string;        // contextual message depending on position
          trofeos: Array<any>;    // trophies/achievements related to ranking
        }
      */

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
