import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { mapAxiosError } from '../../common/http-proxy.util';
import { SaveAvatarDto } from './dto/save-avatar.dto';


const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

@ApiTags('Avatar - Ropa')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('avatar/ropa')
/**
 * Gateway controller that proxies "avatar clothing" requests
 * to the retos-service, preserving authentication and request context.
 */
export class AvatarRopaGatewayController {
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
  // GET /avatar/ropa/equipada
  // ===========================
  @Get('equipada')
  @ApiOperation({
    summary: "Get the avatar's currently equipped clothing for the user",
    description:
      'The user identifier is resolved from the JWT in the retos-service. This gateway only forwards the request.',
  })
  async getEquipada(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/avatar/ropa/equipada'),
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
  // POST /avatar/ropa/guardar
  // ===========================
  @Post('guardar')
  @ApiOperation({
    summary: "Persist the avatar's equipped clothing configuration",
    description:
      'The payload describes which clothing items are equipped on each slot. The user is inferred from the JWT in the retos-service.',
  })
  @ApiBody({
    type: SaveAvatarDto,
    description: 'Avatar equipment configuration to be saved for the user',
  })
  async guardar(
    @Req() req: any,
    @Body() body: SaveAvatarDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/avatar/ropa/guardar'),
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
