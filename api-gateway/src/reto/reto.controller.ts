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

@ApiTags('Retos')
@ApiBearerAuth('jwt-auth')
@Controller('reto')
export class RetoGatewayController {
  private readonly retosBase: string;

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {
    this.retosBase = this.cfg.get<string>('RETOS_URL') || 'http://retos-service:3550';
  }

  // =================== LISTAR / VER ===================

  @Get('listar-dto')
  @ApiOperation({ summary: 'Listar retos (DTO compacto)' })
  async listarDto(@Req() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/listar-dto`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('listar')
  @ApiOperation({ summary: 'Listar retos (raw)' })
  async listar(@Req() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/listar`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('ver/:cod')
  @ApiOperation({ summary: 'Ver reto por ID (versión simple)' })
  @ApiParam({ name: 'cod', type: Number })
  async ver(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/ver/${cod}`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('ver/full/:cod')
  @ApiOperation({ summary: 'Ver reto con detalle completo' })
  @ApiParam({ name: 'cod', type: Number })
  async verFull(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/ver/full/${cod}`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =================== VISTAS DE DÍA / STATS ===================

  @Get('dia')
  @ApiOperation({ summary: 'Retos del día por usuario' })
  @ApiQuery({ name: 'fecha', required: false })
  @ApiQuery({ name: 'usuario', required: false })
  async dia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('usuario') usuario?: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/dia`, {
          params: { fecha, usuario },
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('progreso-dia')
  @ApiOperation({ summary: 'Progreso agregado del día' })
  @ApiQuery({ name: 'fecha', required: false })
  @ApiQuery({ name: 'usuario', required: false })
  async progresoDia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('usuario') usuario?: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/progreso-dia`, {
          params: { fecha, usuario },
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('operarios-dia')
  @ApiOperation({ summary: 'Operarios del día con stats' })
  @ApiQuery({ name: 'fecha', required: false })
  async operariosDia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/operarios-dia`, {
          params: { fecha },
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('operarios-count')
  @ApiOperation({ summary: 'Total de operarios' })
  async operariosCount(@Req() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/operarios-count`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('participacion-semanal')
  @ApiOperation({ summary: 'Participación semanal' })
  @ApiQuery({ name: 'fecha', required: false })
  async participacionSemanal(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/participacion-semanal`, {
          params: { fecha },
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =================== ENDPOINTS DE CRON ===================

  @Post('cron/asignar')
  @ApiOperation({ summary: 'Ejecutar cron: asignar retos automáticos' })
  @ApiQuery({ name: 'fecha', required: false })
  async cronAsignar(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.retosBase}/reto/cron/asignar`,
          {},
          {
            params: { fecha },
            headers: { Authorization: req.headers['authorization'] || '' },
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Post('cron/vencer')
  @ApiOperation({ summary: 'Ejecutar cron: marcar retos vencidos' })
  @ApiQuery({ name: 'fecha', required: false })
  async cronVencer(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.retosBase}/reto/cron/vencer`,
          {},
          {
            params: { fecha },
            headers: { Authorization: req.headers['authorization'] || '' },
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('cron/dry-run')
  @ApiOperation({ summary: 'Ver candidatos de cron (dry run)' })
  @ApiQuery({ name: 'fecha', required: false })
  async cronDryRun(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/cron/dry-run`, {
          params: { fecha },
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =================== CRUD / QUIZ ===================

  @Post('crear')
  @ApiOperation({ summary: 'Crear reto (admin)' })
  @ApiBody({ description: 'Payload de reto genérico o quiz', required: true })
  async crear(@Req() req: any, @Body() body: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.retosBase}/reto/crear`, body, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Post('crear-quiz')
  @ApiOperation({ summary: 'Crear quiz con estructura completa (admin)' })
  @ApiBody({ description: 'Payload completo del quiz', required: true })
  async crearQuiz(@Req() req: any, @Body() body: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.retosBase}/reto/crear-quiz`, body, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Put('modificar')
  @ApiOperation({ summary: 'Modificar reto (admin)' })
  @ApiBody({ description: 'Reto con codReto + cambios', required: true })
  async modificar(@Req() req: any, @Body() body: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.retosBase}/reto/modificar`, body, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Put('quiz/sobrescribir')
  @ApiOperation({ summary: 'Sobrescribir preguntas de un quiz' })
  @ApiBody({ description: 'Body con codReto y preguntas[]', required: true })
  async sobrescribirQuiz(@Req() req: any, @Body() body: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.retosBase}/reto/quiz/sobrescribir`, body, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Delete('borrar/:codReto')
  @ApiOperation({ summary: 'Borrar reto (admin)' })
  @ApiParam({ name: 'codReto', type: Number })
  async borrar(
    @Req() req: any,
    @Param('codReto', ParseIntPipe) codReto: number,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.delete(`${this.retosBase}/reto/borrar/${codReto}`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // =================== DETALLES / CARGOS ===================

  @Get(':cod/cargos')
  @ApiOperation({ summary: 'Ver cargos asociados a un reto' })
  @ApiParam({ name: 'cod', type: Number })
  async cargosDeReto(
    @Req() req: any,
    @Param('cod', ParseIntPipe) cod: number,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/${cod}/cargos`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get(':codReto')
  @ApiOperation({ summary: 'Detalle de reto (metadata principal)' })
  @ApiParam({ name: 'codReto', type: Number })
  async detalle(
    @Req() req: any,
    @Param('codReto', ParseIntPipe) codReto: number,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.retosBase}/reto/${codReto}`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
