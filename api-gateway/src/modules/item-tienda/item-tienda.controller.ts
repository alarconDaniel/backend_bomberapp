// src/modules/public/item-tienda/item-tienda.controller.ts

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
import { ComprarItemDto } from './dto/comprar-item.dto';


const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

@ApiTags('Item Tienda')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('item-tienda')
/**
 * Controller that exposes shop item endpoints
 * and forwards requests to the retos-service, preserving authentication.
 */
export class ItemTiendaController {
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
  // GET /item-tienda/listar
  // ===========================
  @Get('listar')
  @ApiOperation({
    summary: 'List shop items for the current user',
    description:
      'Returns the available shop items, including flags like "already owned" and rotation rules. The user is resolved from the JWT in retos-service.',
  })
  async listarItemsTienda(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/item-tienda/listar'), {
          headers: this.buildAuthHeaders(req),
        }),
      );

      // Shape depends on retos-service, typically a list of shop items
      // enriched with ownership and rotation data.
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // POST /item-tienda/comprar
  // ===========================
  @Post('comprar')
  @ApiOperation({
    summary: 'Purchase an item from the shop',
    description:
      'Consumes user currency/points to buy the specified item. The user is inferred from the JWT in retos-service.',
  })
  @ApiBody({
    type: ComprarItemDto,
    description:
      'Payload specifying which item to buy and the quantity to purchase',
  })
  async comprar(
    @Req() req: any,
    @Body() dto: ComprarItemDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/item-tienda/comprar'),
          dto,
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
