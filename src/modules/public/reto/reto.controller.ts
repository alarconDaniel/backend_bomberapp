import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put,
  UseGuards, Req, ForbiddenException, BadRequestException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RetoService } from './reto.service';
import * as dayjs from 'dayjs';

@UseGuards(AuthGuard('jwt'))
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


  @Get('listar')
  listar() {
    return this.retoService.listar();
  }

  @Get(':codReto')
  detalle(@Param('codReto', ParseIntPipe) codReto: number) {
    return this.retoService.detalle(codReto);
  }

  @Post('crear')
  crear(@Req() req: Request, @Body() body: any) {
    const u = (req as any).user;
    if (!isAdmin(u)) throw new ForbiddenException('Solo admin puede crear retos');
    return this.retoService.crear(body);
  }

  @Delete('borrar/:codReto')
  borrar(@Req() req: Request, @Param('codReto', ParseIntPipe) codReto: number) {
    const u = (req as any).user;
    if (!isAdmin(u)) throw new ForbiddenException('Solo admin puede borrar retos');
    return this.retoService.borrar(codReto);
  }

  // 🔧 NUEVO: modificar (PUT /api/reto/modificar) con codReto en el body
  @Put('modificar')
  modificar(@Req() req: Request, @Body() body: any) {
    const u = (req as any).user;
    if (!isAdmin(u)) throw new ForbiddenException('Solo admin puede modificar retos');

    const codReto = Number(body?.codReto ?? body?.cod_reto);
    if (!Number.isFinite(codReto)) {
      throw new BadRequestException('codReto es requerido y debe ser numérico');
    }
    return this.retoService.modificar(codReto, body);
  }
}

/** Helper robusto que acepta múltiples formas de rol en el JWT */
function isAdmin(user: any): boolean {
  if (!user) return false;
  const flat = [
    user.rol, user.role, user.roleId, user.rolId, user.codRol, user.cod_rol,
    user.idRol, user.id_rol, user.nombreRol, user.nombre_rol, user.perfil, user.isAdmin,
  ].filter(v => v !== undefined && v !== null);

  for (const v of flat) {
    if (v === true || v === 1) return true;
    const s = String(v).trim().toLowerCase();
    if (s === 'admin' || s === 'administrador' || s === '1') return true;
    const n = Number(s);
    if (!Number.isNaN(n) && n === 1) return true;
  }

  const nested = user.rol || user.role;
  if (nested) {
    const name = String(nested.name ?? nested.nombre ?? '').trim().toLowerCase();
    const id = Number(nested.id ?? nested.codRol ?? nested.cod_rol);
    if (name === 'admin' || name === 'administrador' || id === 1) return true;
  }

  if (Array.isArray(user.roles)) {
    for (const r of user.roles) {
      const name = String((r && (r.name ?? r.nombre)) ?? r).trim().toLowerCase();
      const id = Number(r?.id ?? r?.codRol ?? r?.cod_rol);
      if (name === 'admin' || name === 'administrador' || id === 1) return true;
    }
  }
  return false;
}
