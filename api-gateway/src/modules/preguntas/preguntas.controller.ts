// src/modules/preguntas/preguntas.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { CreatePreguntaDto } from './dto/create-pregunta.dto';
import { UpdatePreguntaDto } from './dto/update-pregunta.dto';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

@ApiTags('Preguntas')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('preguntas')
/**
 * Controller that exposes question management endpoints
 * and forwards requests to the retos-service.
 */
export class PreguntasController {
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
  // POST /preguntas
  // ===========================
  @Post()
  @ApiOperation({
    summary: 'Create a new question for a challenge',
    description:
      'Creates a question associated with a specific challenge (reto). If no explicit order is provided, the backend assigns the next available position.',
  })
  @ApiBody({
    type: CreatePreguntaDto,
    description: 'Question payload to be created',
  })
  async create(
    @Req() req: any,
    @Body() dto: CreatePreguntaDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(this.buildRetosUrl('/preguntas'), dto, {
          headers: this.buildAuthHeaders(req),
        }),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // GET /preguntas?codReto=...
  // ===========================
  @Get()
  @ApiOperation({
    summary: 'List all questions for a given challenge',
  })
  @ApiQuery({
    name: 'codReto',
    type: Number,
    required: true,
    description: 'Challenge identifier whose questions will be listed',
    example: 10,
  })
  async listByReto(
    @Req() req: any,
    @Query('codReto', ParseIntPipe) codReto: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl('/preguntas'), {
          params: { codReto },
          headers: this.buildAuthHeaders(req),
        }),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // GET /preguntas/:id
  // ===========================
  @Get(':id')
  @ApiOperation({
    summary: 'Get a question by its identifier',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Question identifier',
    example: 42,
  })
  async get(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.buildRetosUrl(`/preguntas/${id}`), {
          headers: this.buildAuthHeaders(req),
        }),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // PATCH /preguntas/:id
  // ===========================
  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing question',
    description:
      'Partially updates a question identified by its ID. Only the provided fields will be modified.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Question identifier',
    example: 42,
  })
  @ApiBody({
    type: UpdatePreguntaDto,
    description: 'Fields to update in the question',
  })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePreguntaDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(this.buildRetosUrl(`/preguntas/${id}`), dto, {
          headers: this.buildAuthHeaders(req),
        }),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // DELETE /preguntas/:id
  // ===========================
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a question',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Question identifier',
    example: 42,
  })
  async remove(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(this.buildRetosUrl(`/preguntas/${id}`), {
          headers: this.buildAuthHeaders(req),
        }),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // POST /preguntas/swap-orden
  // ===========================
  @Post('swap-orden')
  @ApiOperation({
    summary: 'Swap the order of two questions within a challenge',
    description:
      'Swaps the order/position of two questions (a and b) that belong to the same challenge (codReto).',
  })
  @ApiQuery({
    name: 'codReto',
    type: Number,
    required: true,
    description: 'Challenge identifier that owns the questions',
    example: 10,
  })
  @ApiQuery({
    name: 'a',
    type: Number,
    required: true,
    description: 'First question identifier involved in the swap',
    example: 101,
  })
  @ApiQuery({
    name: 'b',
    type: Number,
    required: true,
    description: 'Second question identifier involved in the swap',
    example: 102,
  })
  async swap(
    @Req() req: any,
    @Query('codReto', ParseIntPipe) codReto: number,
    @Query('a', ParseIntPipe) a: number,
    @Query('b', ParseIntPipe) b: number,
  ): Promise<unknown> {
    try {
      const params = { codReto, a, b };

      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildRetosUrl('/preguntas/swap-orden'),
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
}
