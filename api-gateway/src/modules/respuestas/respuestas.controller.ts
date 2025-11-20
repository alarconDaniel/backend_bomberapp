// src/modules/respuestas/respuestas.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
import { CreateRespuestaPreguntaDto } from './dto/create-respuesta-pregunta.dto';
import { CreateRespuestaFormularioDto } from './dto/create-respuesta-formulario.dto';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

@ApiTags('Respuestas')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('respuestas')
/**
 * Controller that exposes "respuestas" endpoints
 * and forwards requests to the retos-service.
 */
export class RespuestasController {
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

  // ====================================================
  //            PREGUNTAS (quiz/reportes)
  // ====================================================

  // POST /respuestas/pregunta
  @Post('pregunta')
  @ApiOperation({
    summary: 'Create an answer for a question',
    description:
      'Stores the answer for a specific question within a user-challenge assignment.',
  })
  @ApiBody({
    type: CreateRespuestaPreguntaDto,
    description: 'Answer payload for a question',
  })
  async createRespuestaPregunta(
    @Req() req: any,
    @Body() dto: CreateRespuestaPreguntaDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/respuestas/pregunta'),
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

  // GET /respuestas/pregunta?codUsuarioReto=...
  @Get('pregunta')
  @ApiOperation({
    summary: 'List answers to questions for a user-challenge assignment',
  })
  @ApiQuery({
    name: 'codUsuarioReto',
    type: Number,
    required: true,
    description:
      'Identifier of the user-challenge assignment whose question answers will be listed',
    example: 123,
  })
  async listRespuestasPregunta(
    @Req() req: any,
    @Query('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/respuestas/pregunta'),
          {
            params: { codUsuarioReto },
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ====================================================
  //                 FORMULARIOS
  // ====================================================

  // POST /respuestas/formulario
  @Post('formulario')
  @ApiOperation({
    summary: 'Create a form response',
    description:
      'Stores the form submission data associated with a specific user-challenge assignment and challenge.',
  })
  @ApiBody({
    type: CreateRespuestaFormularioDto,
    description: 'Form response payload to be stored',
  })
  async createRespuestaFormulario(
    @Req() req: any,
    @Body() dto: CreateRespuestaFormularioDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/respuestas/formulario'),
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

  // GET /respuestas/formulario/:id
  @Get('formulario/:id')
  @ApiOperation({
    summary: 'Get a single form response by its identifier',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Form response identifier',
    example: 77,
  })
  async getRespuestaFormulario(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl(`/respuestas/formulario/${id}`),
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

  // GET /respuestas/formulario?codReto=...
  @Get('formulario')
  @ApiOperation({
    summary: 'List form responses for a given challenge',
  })
  @ApiQuery({
    name: 'codReto',
    type: Number,
    required: true,
    description: 'Challenge identifier whose form responses will be listed',
    example: 12,
  })
  async listRespuestasFormulario(
    @Req() req: any,
    @Query('codReto', ParseIntPipe) codReto: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/respuestas/formulario'),
          {
            params: { codReto },
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
