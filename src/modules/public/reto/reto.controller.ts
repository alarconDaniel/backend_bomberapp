// src/modules/reto/reto.controller.ts
import { Controller, Get, Param, Query, BadRequestException, Post } from '@nestjs/common';
import { RetoService } from './reto.service';
import * as dayjs from 'dayjs';

@Controller('reto')
export class RetoController {
  constructor(private readonly retoService: RetoService) {}

  @Get('listar')
  listarRetos() {
    return this.retoService.listarRetos();
  }

  @Get('ver/:cod')
  verReto(@Param('cod') cod: string) {
    return this.retoService.verReto(Number(cod));
  }

  /**
   * Calendario por día. Ej:
   *   GET /reto/dia?fecha=2025-08-23&usuario=3
   * Si tienes auth con JWT, toma el usuario del token y omite ?usuario
   */
  @Get('dia')
  async listarPorDia(@Query('fecha') fecha?: string, @Query('usuario') usuario?: string) {
    const ymd = fecha || dayjs().format('YYYY-MM-DD');
    const uid = Number(usuario);
    if (!uid) throw new BadRequestException('Falta ?usuario=ID');

    const hoy = dayjs().format('YYYY-MM-DD');
    if (dayjs(ymd).isAfter(hoy)) {
      throw new BadRequestException('No puedes ver días futuros');
    }
    return this.retoService.listarPorDia(uid, ymd);
  }

  // ==== utilidades para pruebas de cron (opcionales) ====
  @Post('cron/asignar')
  async cronAsignar(@Query('fecha') fecha?: string) {
    const ymd = fecha || dayjs().format('YYYY-MM-DD');
    return this.retoService.asignarAutomaticosSiLaboral(ymd);
  }

  @Post('cron/vencer')
  async cronVencer(@Query('fecha') fecha?: string) {
    const ymd = fecha || dayjs().format('YYYY-MM-DD');
    return this.retoService.marcarVencidos(ymd);
  }
}
