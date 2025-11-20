// src/modules/public/reto/reto.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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

import { mapAxiosError } from '../../common/http-proxy.util';

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

@ApiTags('Reto')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('reto')
/**
 * Gateway controller that exposes "reto" endpoints
 * and forwards requests to the retos-service, preserving authentication.
 *
 * All authorization and business rules (admin checks, date validation, etc.)
 * are handled in the retos-service.
 */
export class RetoController {
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

  // =====================================================
  // LIST + VIEW
  // =====================================================

  // GET /reto/listar-dto
  @Get('listar-dto')
  @ApiOperation({
    summary: 'List challenges (compact DTO)',
    description:
      'Returns a compact DTO list of challenges, intended for dropdowns and simple selectors.',
  })
  async listarDto(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/reto/listar-dto'), {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // GET /reto/listar
  @Get('listar')
  @ApiOperation({
    summary: 'List challenges (raw)',
    description:
      'Returns the raw list of challenges using the underlying repository find() (compatibility endpoint).',
  })
  async listarRetos(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/reto/listar'), {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // GET /reto/ver/:cod
  @Get('ver/:cod')
  @ApiOperation({
    summary: 'Get challenge by id',
    description: 'Returns the basic information of a challenge by its id.',
  })
  @ApiParam({
    name: 'cod',
    type: Number,
    description: 'Challenge identifier',
    example: 10,
  })
  async verReto(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl(`/reto/ver/${cod}`), {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // GET /reto/ver/full/:cod
  @Get('ver/full/:cod')
  @ApiOperation({
    summary: 'Get full challenge definition',
    description:
      'Returns the fully expanded challenge, including quiz questions or form metadata.',
  })
  @ApiParam({
    name: 'cod',
    type: Number,
    description: 'Challenge identifier',
    example: 10,
  })
  async verRetoFull(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl(`/reto/ver/full/${cod}`), {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =====================================================
  // DAY CALENDAR + PROGRESS + STATS
  // =====================================================

  // GET /reto/dia
  @Get('dia')
  @ApiOperation({
    summary: 'List user challenge assignments for a given day',
    description:
      'Returns the calendar view of user challenge assignments for a specific day.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description:
      'Date in YYYY-MM-DD format. If omitted, the service uses today by default.',
    example: '2025-01-15',
  })
  @ApiQuery({
    name: 'usuario',
    required: false,
    description:
      'Optional user id to inspect another user. If omitted, the authenticated user is used.',
    example: '123',
  })
  async listarPorDia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('usuario') usuario?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string> = {};
      if (fecha !== undefined) params.fecha = fecha;
      if (usuario !== undefined) params.usuario = usuario;

      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/reto/dia'), {
          params,
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // GET /reto/progreso-dia
  @Get('progreso-dia')
  @ApiOperation({
    summary: 'Get aggregated progress by challenge for a given day',
    description:
      'Returns aggregated progress per challenge for the specified day, optionally scoped to a user.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description:
      'Date in YYYY-MM-DD format. If omitted, the service uses today by default.',
    example: '2025-01-15',
  })
  @ApiQuery({
    name: 'usuario',
    required: false,
    description:
      'Optional user id for personalized aggregation. If not provided, the authenticated user is used.',
    example: '123',
  })
  async progresoDia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('usuario') usuario?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string> = {};
      if (fecha !== undefined) params.fecha = fecha;
      if (usuario !== undefined) params.usuario = usuario;

      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/reto/progreso-dia'), {
          params,
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // GET /reto/operarios-dia
  @Get('operarios-dia')
  @ApiOperation({
    summary: 'Get operator stats for a given day',
    description:
      'Returns per-operator statistics (completed challenges, uploaded reports) for the specified date.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description:
      'Date in YYYY-MM-DD format. If omitted, the service uses today by default.',
    example: '2025-01-15',
  })
  async operariosDia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string> = {};
      if (fecha !== undefined) params.fecha = fecha;

      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/reto/operarios-dia'), {
          params,
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // GET /reto/operarios-count
  @Get('operarios-count')
  @ApiOperation({
    summary: 'Count total operators',
    description:
      'Returns the total number of operators (users with role cod_rol = 2).',
  })
  async operariosCount(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/reto/operarios-count'), {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // GET /reto/participacion-semanal
  @Get('participacion-semanal')
  @ApiOperation({
    summary: 'Weekly participation for a month',
    description:
      'Returns aggregated participation per week for the month of the provided date.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description:
      'Optional date in YYYY-MM-DD format. The month of this date is used for aggregation.',
    example: '2025-01-15',
  })
  async participacionSemanal(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string> = {};
      if (fecha !== undefined) params.fecha = fecha;

      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/reto/participacion-semanal'),
          {
            params,
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =====================================================
  // CRON UTILITIES (admin via retos-service)
  // =====================================================

  // POST /reto/cron/asignar
  @Post('cron/asignar')
  @ApiOperation({
    summary: 'Run automatic assignment cron for a given date',
    description:
      'Triggers the cron routine that assigns automatic challenges if the given date is a business day.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description:
      'Date in YYYY-MM-DD format. If omitted, the service uses today by default.',
    example: '2025-01-15',
  })
  async cronAsignar(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string> = {};
      if (fecha !== undefined) params.fecha = fecha;

      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/reto/cron/asignar'),
          {},
          {
            params,
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // POST /reto/cron/vencer
  @Post('cron/vencer')
  @ApiOperation({
    summary: 'Run expiration cron for a given date',
    description:
      'Marks user-challenge assignments as expired based on the provided date.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description:
      'Date in YYYY-MM-DD format. If omitted, the service uses today by default.',
    example: '2025-01-15',
  })
  async cronVencer(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string> = {};
      if (fecha !== undefined) params.fecha = fecha;

      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/reto/cron/vencer'),
          {},
          {
            params,
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // GET /reto/cron/dry-run
  @Get('cron/dry-run')
  @ApiOperation({
    summary: 'Inspect cron automatic assignment candidates for a date',
    description:
      'Returns which users and challenges would be affected by the automatic assignment cron for the given date.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description:
      'Date in YYYY-MM-DD format. If omitted, the service uses today by default.',
    example: '2025-01-15',
  })
  async cronDryRun(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const params: Record<string, string> = {};
      if (fecha !== undefined) params.fecha = fecha;

      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/reto/cron/dry-run'), {
          params,
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =====================================================
  // CREATE / UPDATE / DELETE (admin handled in retos-service)
  // =====================================================

  // POST /reto/crear
  @Post('crear')
  @ApiOperation({
    summary: 'Create a generic challenge',
    description:
      'Creates a challenge. If tipo=quiz and preguntas[] is present, it will create the full quiz structure.',
  })
  @ApiBody({
    description:
      'Challenge payload. Shape is validated and normalized by retos-service.',
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  })
  async crear(
    @Req() req: any,
    @Body() body: any,
  ): Promise<unknown> {
    try {
      // reto-service handles admin check and payload normalization
      const { data } = await firstValueFrom(
        this.httpService.post(this.buildRetosUrl('/reto/crear'), body, {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // POST /reto/crear-quiz
  @Post('crear-quiz')
  @ApiOperation({
    summary: 'Create a full quiz challenge',
    description:
      'Creates a new quiz-type challenge, inserting both the challenge and all its questions/options metadata.',
  })
  @ApiBody({
    description:
      'Quiz payload including challenge metadata and preguntas[] as defined by retos-service.',
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  })
  async crearQuiz(
    @Req() req: any,
    @Body() body: any,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(this.buildRetosUrl('/reto/crear-quiz'), body, {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // PUT /reto/modificar
  @Put('modificar')
  @ApiOperation({
    summary: 'Modify an existing challenge',
    description:
      'Updates an existing challenge. Admin validation and payload cleaning are handled in retos-service.',
  })
  @ApiBody({
    description:
      'Payload including codReto and fields to update. Validation is performed by retos-service.',
    schema: {
      type: 'object',
      properties: {
        codReto: {
          type: 'number',
          description: 'Challenge identifier to modify',
          example: 10,
        },
      },
      required: ['codReto'],
      additionalProperties: true,
    },
  })
  async modificar(
    @Req() req: any,
    @Body() body: any,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.put(this.buildRetosUrl('/reto/modificar'), body, {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // DELETE /reto/borrar/:codReto
  @Delete('borrar/:codReto')
  @ApiOperation({
    summary: 'Delete a challenge by id',
    description:
      'Deletes a challenge. Only admins may perform this operation, enforced in retos-service.',
  })
  @ApiParam({
    name: 'codReto',
    type: Number,
    description: 'Challenge identifier to delete',
    example: 10,
  })
  async borrar(
    @Req() req: any,
    @Param('codReto', ParseIntPipe) codReto: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(
          this.buildRetosUrl(`/reto/borrar/${codReto}`),
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

  // PUT /reto/quiz/sobrescribir
  @Put('quiz/sobrescribir')
  @ApiOperation({
    summary: 'Overwrite quiz questions of a challenge',
    description:
      'Overwrites the quiz questions for a given challenge, preserving answered questions according to business rules.',
  })
  @ApiBody({
    description:
      'Payload containing codReto and preguntas[] to upsert. Validation is handled by retos-service.',
    schema: {
      type: 'object',
      properties: {
        codReto: {
          type: 'number',
          description: 'Quiz challenge identifier to overwrite',
          example: 10,
        },
        preguntas: {
          type: 'array',
          description: 'Array of question definitions to upsert',
          items: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
      required: ['codReto', 'preguntas'],
    },
  })
  async sobrescribirQuiz(
    @Req() req: any,
    @Body() body: any,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.put(
          this.buildRetosUrl('/reto/quiz/sobrescribir'),
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

  // =====================================================
  // DETAIL + CARGOS
  // =====================================================

  // GET /reto/:codReto
  @Get(':codReto')
  @ApiOperation({
    summary: 'Get detailed DTO of a challenge',
    description:
      'Returns the detailed DTO representation for a challenge (basic fields only).',
  })
  @ApiParam({
    name: 'codReto',
    type: Number,
    description: 'Challenge identifier',
    example: 10,
  })
  async detalle(
    @Req() req: any,
    @Param('codReto', ParseIntPipe) codReto: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl(`/reto/${codReto}`), {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // GET /reto/:cod/cargos
  @Get(':cod/cargos')
  @ApiOperation({
    summary: 'Get job positions (cargos) associated with a challenge',
    description:
      'Returns the list of job positions bound to the specified challenge.',
  })
  @ApiParam({
    name: 'cod',
    type: Number,
    description: 'Challenge identifier',
    example: 10,
  })
  async cargosDeReto(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl(`/reto/${cod}/cargos`), {
          headers: this.buildAuthHeaders(req),
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
