// src/reto/reto.gateway.controller.ts
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

import { mapAxiosError } from '../common/http-proxy.util';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://retos-service:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

/**
 * Gateway controller that exposes "reto" endpoints and
 * forwards them to the retos-service, preserving authentication context.
 */
@ApiTags('Retos')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('reto')
export class RetoGatewayController {
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

  // =================== LISTAR / VER ===================

  @Get('listar-dto')
  @ApiOperation({ summary: 'List challenges (compact DTO)' })
  async listarDto(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/reto/listar-dto'),
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

  @Get('listar')
  @ApiOperation({ summary: 'List challenges (raw)' })
  async listar(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/reto/listar'),
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

  @Get('ver/:cod')
  @ApiOperation({ summary: 'View challenge by id (simple version)' })
  @ApiParam({ name: 'cod', type: Number })
  async ver(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl(`/reto/ver/${cod}`),
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

  @Get('ver/full/:cod')
  @ApiOperation({ summary: 'View challenge with full detail' })
  @ApiParam({ name: 'cod', type: Number })
  async verFull(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl(`/reto/ver/full/${cod}`),
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

  // =================== VIEWS BY DAY / STATS ===================

  @Get('dia')
  @ApiOperation({ summary: 'Challenges of the day per user' })
  @ApiQuery({ name: 'fecha', required: false })
  @ApiQuery({ name: 'usuario', required: false })
  async dia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('usuario') usuario?: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/reto/dia'),
          {
            params: { fecha, usuario },
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('progreso-dia')
  @ApiOperation({ summary: 'Aggregated daily progress' })
  @ApiQuery({ name: 'fecha', required: false })
  @ApiQuery({ name: 'usuario', required: false })
  async progresoDia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('usuario') usuario?: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/reto/progreso-dia'),
          {
            params: { fecha, usuario },
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('operarios-dia')
  @ApiOperation({ summary: 'Operators of the day with stats' })
  @ApiQuery({ name: 'fecha', required: false })
  async operariosDia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/reto/operarios-dia'),
          {
            params: { fecha },
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('operarios-count')
  @ApiOperation({ summary: 'Total number of operators' })
  async operariosCount(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/reto/operarios-count'),
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

  @Get('participacion-semanal')
  @ApiOperation({ summary: 'Weekly participation' })
  @ApiQuery({ name: 'fecha', required: false })
  async participacionSemanal(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/reto/participacion-semanal'),
          {
            params: { fecha },
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =================== CRON ENDPOINTS ===================

  @Post('cron/asignar')
  @ApiOperation({ summary: 'Run cron: assign automatic challenges' })
  @ApiQuery({ name: 'fecha', required: false })
  async cronAsignar(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/reto/cron/asignar'),
          {},
          {
            params: { fecha },
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Post('cron/vencer')
  @ApiOperation({ summary: 'Run cron: mark expired challenges' })
  @ApiQuery({ name: 'fecha', required: false })
  async cronVencer(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/reto/cron/vencer'),
          {},
          {
            params: { fecha },
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('cron/dry-run')
  @ApiOperation({ summary: 'Preview cron candidates (dry run)' })
  @ApiQuery({ name: 'fecha', required: false })
  async cronDryRun(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/reto/cron/dry-run'),
          {
            params: { fecha },
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =================== CRUD / QUIZ ===================

  @Post('crear')
  @ApiOperation({ summary: 'Create challenge (admin)' })
  @ApiBody({ description: 'Generic challenge or quiz payload', required: true })
  async crear(@Req() req: any, @Body() body: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/reto/crear'),
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

  @Post('crear-quiz')
  @ApiOperation({ summary: 'Create quiz with full structure (admin)' })
  @ApiBody({ description: 'Full quiz payload', required: true })
  async crearQuiz(@Req() req: any, @Body() body: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/reto/crear-quiz'),
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

  @Put('modificar')
  @ApiOperation({ summary: 'Modify challenge (admin)' })
  @ApiBody({ description: 'Challenge with codReto + changes', required: true })
  async modificar(@Req() req: any, @Body() body: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.put(
          this.buildRetosUrl('/reto/modificar'),
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

  @Put('quiz/sobrescribir')
  @ApiOperation({ summary: 'Overwrite quiz questions' })
  @ApiBody({
    description: 'Body with codReto and preguntas[]',
    required: true,
  })
  async sobrescribirQuiz(@Req() req: any, @Body() body: any): Promise<unknown> {
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

  @Delete('borrar/:codReto')
  @ApiOperation({ summary: 'Delete challenge (admin)' })
  @ApiParam({ name: 'codReto', type: Number })
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

  // =================== DETAILS / ROLES ===================

  @Get(':cod/cargos')
  @ApiOperation({ summary: 'View roles (cargos) associated with a challenge' })
  @ApiParam({ name: 'cod', type: Number })
  async cargosDeReto(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl(`/reto/${cod}/cargos`),
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

  @Get(':codReto')
  @ApiOperation({ summary: 'Challenge details (main metadata)' })
  @ApiParam({ name: 'codReto', type: Number })
  async detalle(
    @Req() req: any,
    @Param('codReto', ParseIntPipe) codReto: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl(`/reto/${codReto}`),
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
