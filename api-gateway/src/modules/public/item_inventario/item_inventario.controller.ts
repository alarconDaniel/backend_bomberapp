// src/modules/public/item_inventario/item_inventario.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { mapAxiosError } from '../../../common/http-proxy.util';
import { AbrirCofreDto } from './dto/abrir-cofre.dto';


const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

@ApiTags('Item Inventario')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('item-inventario')
/**
 * Controller that exposes inventory item endpoints
 * and forwards requests to the retos-service, preserving authentication.
 */
export class ItemInventarioController {
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
  // GET /item-inventario/listar
  // ===========================
  @Get('listar')
  @ApiOperation({
    summary: 'List current user inventory items',
    description:
      'Returns the inventory items associated with the authenticated user. The user is resolved from the JWT in retos-service.',
  })
  async listar(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/item-inventario/listar'),
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      // Expected shape:
      // {
      //   usuario: { codUsuario: number },
      //   items: Array<...>,
      //   total: number
      // }
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // POST /item-inventario/abrir-cofre
  // ===========================
  @Post('abrir-cofre')
  @ApiOperation({
    summary: 'Open a chest item in the inventory',
    description:
      'Consumes one chest (cofre) from the user inventory and returns the rewards. The user is inferred from the JWT; the body identifies the inventory item to open.',
  })
  @ApiBody({
    type: AbrirCofreDto,
    description:
      'Payload identifying which inventory chest item should be opened',
  })
  async abrirCofre(
    @Req() req: any,
    @Body() body: AbrirCofreDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/item-inventario/abrir-cofre'),
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

  // ===========================
  // GET /item-inventario/:cod
  // ===========================
  @Get(':cod')
  @ApiOperation({
    summary: 'Get an inventory item by its identifier',
  })
  @ApiParam({
    name: 'cod',
    type: Number,
    description: 'Inventory item identifier',
    example: 42,
  })
  async obtenerPorCodigoItem(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl(`/item-inventario/${cod}`),
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
