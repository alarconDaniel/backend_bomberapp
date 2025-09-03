
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put,
  UseGuards, Req, ForbiddenException, BadRequestException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RetoService } from './reto.service';
import * as dayjs from 'dayjs';
import { UsuarioService } from 'src/modules/public/usuario/usuario.service';

@UseGuards(AuthGuard('jwt'))
@Controller('reto')
export class RetoController {
  
  constructor(private readonly retoService: RetoService,
    private readonly usuarioService: UsuarioService, 
  ) {}

  @Get('listar')
  listarRetos() {
    return this.retoService.listarRetos();
  }

  @Get('ver/:cod')
  verReto(@Param('cod') cod: string) {
    return this.retoService.verReto(Number(cod));
  }

  @Get('ver/full/:cod')
  async verRetoFull(@Param('cod') cod: string) {
    return this.retoService.verRetoFull(Number(cod));
  }

    /**
   * Calendario por día. Ej:
   *   GET /reto/dia?fecha=2025-08-23&usuario=3
   * Si tienes auth con JWT, toma el usuario del token y omite ?usuario
   */
  @Get('dia')
  async listarPorDia(@Req() req: any, @Query('fecha') fecha?: string, @Query('usuario') usuario?: string) {
    const ymd = fecha || dayjs().format('YYYY-MM-DD');
    const uid = Number(usuario ?? req?.user?.sub);
    if (!uid) throw new BadRequestException('Falta usuario');
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

    //Admin
    @Post('crear')
    async crear(@Req() req: Request, @Body() body: any) {
      const u = (req as any).user;
      const ok = await isAdmin(u, (sub) => this.usuarioService.findById(sub));
      if (!ok) throw new ForbiddenException('Solo admin puede crear retos');
      if ('codReto' in body) delete body.codReto;
      return this.retoService.crear(body);
    }

    @Delete('borrar/:codReto')
    async borrar(@Req() req: Request, @Param('codReto', ParseIntPipe) codReto: number) {
      const u = (req as any).user;
      const ok = await isAdmin(u, (sub) => this.usuarioService.findById(sub)); // ✅
      if (!ok) throw new ForbiddenException('Solo admin puede borrar retos');
      return this.retoService.borrar(codReto);
    }

  // 🔧 NUEVO: modificar (PUT /reto/modificar) con codReto en el body
  @Put('modificar')
  async modificar(@Req() req: Request, @Body() body: any) { // ✅ async
    const u = (req as any).user;
    const ok = await isAdmin(u, (sub) => this.usuarioService.findById(sub)); // ✅
    if (!ok) throw new ForbiddenException('Solo admin puede modificar retos');
  
    const codReto = Number(body?.codReto ?? body?.cod_reto);
    if (!Number.isFinite(codReto)) {
      throw new BadRequestException('codReto es requerido y debe ser numérico');
    }
    return this.retoService.modificar(codReto, body);
  }
}

// helpers/roles.ts
/** Reusa tu lógica, pero en una función pura */
function checkAdminShape(user: any): boolean {
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

  const nested = (user as any).rol || (user as any).role;
  if (nested) {
    const name = String(nested.name ?? nested.nombre ?? '').trim().toLowerCase();
    const id = Number(nested.id ?? nested.codRol ?? nested.cod_rol);
    if (name === 'admin' || name === 'administrador' || id === 1) return true;
  }

  if (Array.isArray((user as any).roles)) {
    for (const r of (user as any).roles) {
      const name = String((r && (r.name ?? r.nombre)) ?? r).trim().toLowerCase();
      const id = Number(r?.id ?? r?.codRol ?? r?.cod_rol);
      if (name === 'admin' || name === 'administrador' || id === 1) return true;
    }
  }
  return false;
}

/** Helper robusto: intenta con lo que venga en req.user; si no hay rol, usa loader(sub) */
export async function isAdmin(
  user: any,
  loader?: (sub: number) => Promise<any>,   // p.ej. usuarioService.findById
): Promise<boolean> {
  if (checkAdminShape(user)) return true;

  const sub = Number(user?.sub);
  if (!Number.isNaN(sub) && loader) {
    try {
      const full = await loader(sub);
      if (!full) return false;

      const merged = {
        ...user,
        // objetos de rol
        rol: full.rol ?? full.role ?? full?.Rol ?? full?.perfil,
        role: full.role ?? full.rol ?? full?.Rol ?? full?.perfil,
        // colecciones
        roles: full.roles ?? full?.Roles ?? [],
        // ids / códigos
        rolId:
          full.rolId ?? full.roleId ?? full.codRol ?? full.cod_rol ??
          full.idRol ?? full.id_rol ?? full?.rol?.id ?? full?.rol?.codRol ?? full?.rol?.cod_rol,
        // nombres
        nombreRol:
          full.nombreRol ?? full.nombre_rol ??
          full?.rol?.nombre ?? full?.rol?.nombre_rol ??
          full?.role?.name ?? full?.role?.nombre,
        // flags
        isAdmin: normalizeBool(full.isAdmin ?? full.is_admin),
        codRol: full.codRol,
        cod_rol: full.cod_rol,
      };

      return checkAdminShape(merged);
    } catch {
      return false; // si el loader falla (DB down, etc.), no reventamos
    }
  }
  return false;
}

function normalizeBool(v: any): boolean | undefined {
  if (v === true || v === false) return v;
  const s = String(v ?? '').trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'yes' || s === 'si') return true;
  if (s === '0' || s === 'false' || s === 'no') return false;
  const n = Number(s);
  if (!Number.isNaN(n)) return n === 1;
  return undefined;
}

