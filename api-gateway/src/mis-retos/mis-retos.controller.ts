// src/mis-retos/mis-retos.gateway.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  ParseIntPipe,
  Query,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { mapAxiosError } from '../common/http-proxy.util';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

const RETO_ESTADO_ENUM = [
  'pendiente',
  'asignado',
  'en_progreso',
  'completado',
  'abandonado',
  'vencido',
] as const;
type RetoEstado = (typeof RETO_ESTADO_ENUM)[number];

const COMODIN_TIPO_ENUM = [
  '50/50',
  'mas_tiempo',
  'protector_racha',
  'double',
  'ave_fenix',
] as const;
type ComodinTipo = (typeof COMODIN_TIPO_ENUM)[number];

@ApiTags('Mis Retos')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('mis-retos')
/**
 * Gateway controller that proxies "my challenges" requests
 * to the retos-service, preserving authentication and request context.
 */
export class MisRetosGatewayController {
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
  // GET /mis-retos/dia
  // ===========================
  @Get('dia')
  @ApiOperation({ summary: 'List my challenges by day' })
  @ApiQuery({ name: 'fecha', required: false })
  async dia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/mis-retos/dia'), {
          params: { fecha },
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // GET /mis-retos/listar
  // ===========================
  @Get('listar')
  @ApiOperation({ summary: 'List my challenges (optionally filtered by status)' })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: RETO_ESTADO_ENUM,
  })
  async listar(
    @Req() req: any,
    @Query('estado') estado?: RetoEstado,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/mis-retos/listar'), {
          params: { estado },
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // GET /mis-retos/resumen
  // ===========================
  @Get('resumen')
  @ApiOperation({ summary: 'Get a summary of my challenges' })
  async resumen(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/mis-retos/resumen'), {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // PATCH /mis-retos/estado
  // ===========================
  @Patch('estado')
  @ApiOperation({ summary: 'Change the status of one of my challenges' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codReto: { type: 'number' },
        estado: {
          type: 'string',
          enum: ['asignado', 'en_progreso', 'completado', 'abandonado', 'vencido'],
        },
      },
      required: ['codReto', 'estado'],
    },
  })
  async cambiarEstado(@Req() req: any, @Body() body: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(this.buildRetosUrl('/mis-retos/estado'), body, {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // POST /mis-retos/abrir
  // ===========================
  @Post('abrir')
  @ApiOperation({ summary: 'Open a challenge (start solving it)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { codReto: { type: 'number' } },
      required: ['codReto'],
    },
  })
  async abrir(@Req() req: any, @Body() body: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/mis-retos/abrir'),
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
  // POST /mis-retos/:codUsuarioReto/quiz/responder
  // ===========================
  @Post(':codUsuarioReto/quiz/responder')
  @ApiOperation({ summary: 'Answer a quiz question for a challenge' })
  @ApiParam({ name: 'codUsuarioReto', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codUsuarioReto: { type: 'number' },
        codPregunta: { type: 'number' },
        valor: {},
        tiempoSeg: { type: 'number', nullable: true },
      },
      required: ['codUsuarioReto', 'codPregunta', 'valor'],
    },
  })
  async responderQuiz(
    @Req() req: any,
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
    @Body() body: any,
  ): Promise<unknown> {
    try {
      const payload = {
        ...body,
        codUsuarioReto: body.codUsuarioReto ?? codUsuarioReto,
      };
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl(
            `/mis-retos/${codUsuarioReto}/quiz/responder`,
          ),
          payload,
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
  // POST /mis-retos/:codUsuarioReto/form/enviar
  // ===========================
  @Post(':codUsuarioReto/form/enviar')
  @ApiOperation({ summary: 'Submit a form associated with a challenge' })
  @ApiParam({ name: 'codUsuarioReto', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codUsuarioReto: { type: 'number' },
        codReto: { type: 'number' },
        data: {},
      },
      required: ['codUsuarioReto', 'codReto', 'data'],
    },
  })
  async enviarForm(
    @Req() req: any,
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
    @Body() body: any,
  ): Promise<unknown> {
    try {
      const payload = {
        ...body,
        codUsuarioReto: body.codUsuarioReto ?? codUsuarioReto,
      };
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl(
            `/mis-retos/${codUsuarioReto}/form/enviar`,
          ),
          payload,
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
  // POST /mis-retos/:codUsuarioReto/finalizar
  // ===========================
  @Post(':codUsuarioReto/finalizar')
  @ApiOperation({ summary: 'Finish solving a challenge' })
  @ApiParam({ name: 'codUsuarioReto', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codUsuarioReto: { type: 'number' },
      },
      required: ['codUsuarioReto'],
    },
  })
  async finalizar(
    @Req() req: any,
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
    @Body() body: any,
  ): Promise<unknown> {
    try {
      const payload = {
        ...body,
        codUsuarioReto: body.codUsuarioReto ?? codUsuarioReto,
      };
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl(
            `/mis-retos/${codUsuarioReto}/finalizar`,
          ),
          payload,
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
  // POST /mis-retos/:codUsuarioReto/comodines/usar
  // ===========================
  @Post(':codUsuarioReto/comodines/usar')
  @ApiOperation({ summary: 'Use a power-up (comodín) in a challenge' })
  @ApiParam({ name: 'codUsuarioReto', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codUsuarioReto: { type: 'number', nullable: true },
        codPregunta: { type: 'number', nullable: true },
        tipo: {
          type: 'string',
          enum: ['50/50', 'mas_tiempo', 'protector_racha', 'double', 'ave_fenix'],
        },
        segundos: { type: 'number', nullable: true },
        hasta: { type: 'string', nullable: true },
      },
      required: ['tipo'],
    },
  })
  async usarComodin(
    @Req() req: any,
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
    @Body() body: any,
  ): Promise<unknown> {
    try {
      const payload: {
        codUsuarioReto: number;
        codPregunta?: number;
        tipo: ComodinTipo;
        segundos?: number;
        hasta?: string;
        [key: string]: unknown;
      } = {
        ...body,
        codUsuarioReto: body.codUsuarioReto ?? codUsuarioReto,
      };

      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl(
            `/mis-retos/${codUsuarioReto}/comodines/usar`,
          ),
          payload,
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
  // GET /mis-retos/:codUsuarioReto/preguntas
  // ===========================
  @Get(':codUsuarioReto/preguntas')
  @ApiOperation({ summary: 'Get questions for a user challenge assignment' })
  @ApiParam({ name: 'codUsuarioReto', type: Number })
  async preguntas(
    @Req() req: any,
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl(
            `/mis-retos/${codUsuarioReto}/preguntas`,
          ),
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
