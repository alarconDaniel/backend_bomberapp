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

@ApiTags('Mis Retos')
@ApiBearerAuth('jwt-auth')
@Controller('mis-retos')
export class MisRetosGatewayController {
  private readonly retosBase: string;

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {
    this.retosBase =
      this.cfg.get<string>('RETOS_URL') || 'http://localhost:3550';
  }

  private authHeaders(req: any) {
    return { Authorization: req.headers['authorization'] || '' };
  }

  // ===========================
  // GET /mis-retos/dia
  // ===========================
  @Get('dia')
  @ApiOperation({ summary: 'Listar mis retos por día' })
  @ApiQuery({ name: 'fecha', required: false })
  async dia(@Req() req: any, @Query('fecha') fecha?: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/mis-retos/dia`, {
          params: { fecha },
          headers: this.authHeaders(req),
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
  @ApiOperation({ summary: 'Listar mis retos (por estado opcional)' })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['pendiente', 'asignado', 'en_progreso', 'completado', 'abandonado', 'vencido'],
  })
  async listar(
    @Req() req: any,
    @Query('estado')
    estado?:
      | 'pendiente'
      | 'asignado'
      | 'en_progreso'
      | 'completado'
      | 'abandonado'
      | 'vencido',
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/mis-retos/listar`, {
          params: { estado },
          headers: this.authHeaders(req),
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
  @ApiOperation({ summary: 'Resumen de mis retos' })
  async resumen(@Req() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/mis-retos/resumen`, {
          headers: this.authHeaders(req),
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
  @ApiOperation({ summary: 'Cambiar estado de un reto propio' })
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
  async cambiarEstado(@Req() req: any, @Body() body: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.patch(`${this.retosBase}/mis-retos/estado`, body, {
          headers: this.authHeaders(req),
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
  @ApiOperation({ summary: 'Abrir un reto (empezar resolución)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { codReto: { type: 'number' } },
      required: ['codReto'],
    },
  })
  async abrir(@Req() req: any, @Body() body: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.retosBase}/mis-retos/abrir`, body, {
          headers: this.authHeaders(req),
        }),
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
  @ApiOperation({ summary: 'Responder una pregunta de quiz' })
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
  ) {
    try {
      const payload = {
        ...body,
        codUsuarioReto: body.codUsuarioReto ?? codUsuarioReto,
      };
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.retosBase}/mis-retos/${codUsuarioReto}/quiz/responder`,
          payload,
          {
            headers: this.authHeaders(req),
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
  @ApiOperation({ summary: 'Enviar formulario asociado a un reto' })
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
  ) {
    try {
      const payload = {
        ...body,
        codUsuarioReto: body.codUsuarioReto ?? codUsuarioReto,
      };
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.retosBase}/mis-retos/${codUsuarioReto}/form/enviar`,
          payload,
          {
            headers: this.authHeaders(req),
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
  @ApiOperation({ summary: 'Finalizar la resolución de un reto' })
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
  ) {
    try {
      const payload = {
        ...body,
        codUsuarioReto: body.codUsuarioReto ?? codUsuarioReto,
      };
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.retosBase}/mis-retos/${codUsuarioReto}/finalizar`,
          payload,
          {
            headers: this.authHeaders(req),
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
  @ApiOperation({ summary: 'Usar comodín en un reto' })
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
  ) {
    try {
      const payload = {
        ...body,
        codUsuarioReto: body.codUsuarioReto ?? codUsuarioReto,
      };
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.retosBase}/mis-retos/${codUsuarioReto}/comodines/usar`,
          payload,
          {
            headers: this.authHeaders(req),
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
  @ApiOperation({ summary: 'Preguntas de un reto asignado al usuario' })
  @ApiParam({ name: 'codUsuarioReto', type: Number })
  async preguntas(
    @Req() req: any,
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(
          `${this.retosBase}/mis-retos/${codUsuarioReto}/preguntas`,
          {
            headers: this.authHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
