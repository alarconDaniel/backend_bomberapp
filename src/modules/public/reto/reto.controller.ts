// reto.controller.ts
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put,
  UseGuards, Req, ForbiddenException, BadRequestException, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import * as dayjs from 'dayjs';

import { RetoService } from './reto.service';
import { UsuarioService } from 'src/modules/public/usuario/usuario.service';

@UseGuards(AuthGuard('jwt'))
@Controller('reto')
export class RetoController {
  constructor(
    private readonly retoService: RetoService,
    private readonly usuarioService: UsuarioService,
  ) {}

  /** DTO compacto (para selects/listas) */
  @Get('listar-dto')
  listar() {
    return this.retoService.listar();
  }

  /** RAW find() (compatibilidad) */
  @Get('listar')
  listarRetos() {
    return this.retoService.listarRetos();
  }

  @Get('ver/:cod')
  verReto(@Param('cod', ParseIntPipe) cod: number) {
    return this.retoService.verReto(cod);
  }

  @Get('ver/full/:cod')
  async verRetoFull(@Param('cod', ParseIntPipe) cod: number) {
    return this.retoService.verRetoFull(cod);
  }

  /**
   * Calendario por día (asignaciones del usuario).
   * GET /reto/dia?fecha=YYYY-MM-DD&usuario=ID
   * Si hay JWT, toma usuario del token y puedes omitir ?usuario
   */
  @Get('dia')
  async listarPorDia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('usuario') usuario?: string,
  ) {
    const ymd = fecha || dayjs().format('YYYY-MM-DD');
    const uid = Number(usuario ?? req?.user?.sub);
    if (!uid) throw new BadRequestException('Falta usuario');
    const hoy = dayjs().format('YYYY-MM-DD');
    if (dayjs(ymd).isAfter(hoy)) {
      throw new BadRequestException('No puedes ver días futuros');
    }
    return this.retoService.listarPorDia(uid, ymd);
  }

  /**
   * Agregado/progreso de retos del día para HomeScreen
   * GET /reto/progreso-dia?fecha=YYYY-MM-DD[&usuario=ID]
   */
  @Get('progreso-dia')
  async progresoDia(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('usuario') usuario?: string,
  ) {
    const ymd = fecha || dayjs().format('YYYY-MM-DD');
    const uid = usuario ? Number(usuario) : Number(req?.user?.sub ?? -1);
    return this.retoService.progresoDia(ymd, Number.isFinite(uid) ? uid : undefined);
  }

  /**
   * OPERARIOS del día (HomeScreen → tabla Operarios)
   * GET /reto/operarios-dia?fecha=YYYY-MM-DD
   */
  @Get('operarios-dia')
  async operariosDia(@Query('fecha') fecha?: string) {
    const ymd = fecha || dayjs().format('YYYY-MM-DD');
    return this.retoService.operariosStatsDia(ymd);
  }

  /** Total de operarios (cod_rol = 2) */
  @Get('operarios-count')
  operariosCount() {
    return this.retoService.contarOperarios();
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

  @Get(':codReto')
  detalle(@Param('codReto', ParseIntPipe) codReto: number) {
    return this.retoService.detalle(codReto);
  }

  // -------- Crear reto genérico (NO toca tablas de preguntas) --------
  @Post('crear')
  async crear(@Req() req: Request, @Body() body: any) {
    const u = (req as any).user;
    const ok = await isAdmin(u, (sub) => this.usuarioService.findById(sub));
    if (!ok) throw new ForbiddenException('Solo admin puede crear retos');
    if ('codReto' in body) delete body.codReto;
    return this.retoService.crear(body);
  }

  // -------- Crear QUIZ con estructura completa --------
  // (normaliza payload por si el front manda JSON como string en FormData)
  @Post('crear-quiz')
  async crearQuiz(@Req() req: Request, @Body() body: any) {
    const u = (req as any).user;
    const ok = await isAdmin(u, (sub) => this.usuarioService.findById(sub));
    if (!ok) throw new ForbiddenException('Solo admin puede crear retos');

    const payload = normalizeQuizPayload(body);
    return this.retoService.crearQuiz(payload);
  }

  // Modificar reto
  @Put('modificar')
  async modificar(@Req() req: Request, @Body() body: any) {
    const u = (req as any).user;
    const ok = await isAdmin(u, (sub) => this.usuarioService.findById(sub));
    if (!ok) throw new ForbiddenException('Solo admin puede modificar retos');

    const codReto = Number(body?.codReto ?? body?.cod_reto);
    if (!Number.isFinite(codReto)) {
      throw new BadRequestException('codReto es requerido y debe ser numérico');
    }
    return this.retoService.modificar(codReto, body);
  }

  @Delete('borrar/:codReto')
  async borrar(@Req() req: Request, @Param('codReto', ParseIntPipe) codReto: number) {
    const u = (req as any).user;
    const ok = await isAdmin(u, (sub) => this.usuarioService.findById(sub));
    if (!ok) throw new ForbiddenException('Solo admin puede borrar retos');
    return this.retoService.borrar(codReto);
  }

  // QA: ver candidatos del cron según fecha
  @Get('cron/dry-run')
  async dryRun(@Query('fecha') fecha?: string) {
    const ymd = fecha || dayjs().format('YYYY-MM-DD');
    const rows = await (this.retoService as any).ds.query(
      `
      SELECT u.cod_usuario, u.nombre_usuario, u.apellido_usuario, u.cod_cargo_usuario,
             r.cod_reto, r.nombre_reto
      FROM usuarios u
      JOIN cargos_retos cr ON cr.cod_cargo_usuario = u.cod_cargo_usuario
      JOIN retos r          ON r.cod_reto = cr.cod_reto
      WHERE u.cod_rol = 2
        AND r.es_automatico_reto = 1
        AND r.activo = 1
        AND r.fecha_inicio_reto <= ?
        AND r.fecha_fin_reto   >= ?
      ORDER BY u.cod_usuario, r.cod_reto
      `,
      [ymd, ymd],
    );
    return { fecha: ymd, candidatos: rows.length, rows };
  }
}

/* ===================== helpers ===================== */
function parseMaybeJson<T = any>(v: any): T {
  if (typeof v === 'string') {
    try { return JSON.parse(v) as T; } catch { /* ignore */ }
  }
  return v as T;
}

/** Normaliza body para /crear-quiz (por si viene FormData con strings). */
function normalizeQuizPayload(body: any) {
  const out: any = { ...body };
  if (out.tipoReto == null && out.tipo != null) out.tipoReto = out.tipo;

  out.quiz = parseMaybeJson(out.quiz);
  if (out.preguntas == null && out?.quiz?.preguntas != null) {
    out.preguntas = out.quiz.preguntas;
  }
  out.preguntas = parseMaybeJson(out.preguntas);
  if (!Array.isArray(out.preguntas)) out.preguntas = [];
  return out;
}

// ===== helpers/roles.ts =====
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

export async function isAdmin(
  user: any,
  loader?: (sub: number) => Promise<any>,
): Promise<boolean> {
  if (checkAdminShape(user)) return true;

  const sub = Number(user?.sub);
  if (!Number.isNaN(sub) && loader) {
    try {
      const full = await loader(sub);
      if (!full) return false;

      const merged = {
        ...user,
        rol: full.rol ?? full.role ?? full?.Rol ?? full?.perfil,
        role: full.role ?? full.rol ?? full?.Rol ?? full?.perfil,
        roles: full.roles ?? full?.Roles ?? [],
        rolId:
          full.rolId ?? full.roleId ?? full.codRol ?? full.cod_rol ??
          full.idRol ?? full.id_rol ?? full?.rol?.id ?? full?.rol?.codRol ?? full?.rol?.cod_rol,
        nombreRol:
          full.nombreRol ?? full.nombre_rol ??
          full?.rol?.nombre ?? full?.rol?.nombre_rol ??
          full?.role?.name ?? full?.role?.nombre,
        isAdmin: normalizeBool(full.isAdmin ?? full.is_admin),
        codRol: full.codRol,
        cod_rol: full.cod_rol,
      };

      return checkAdminShape(merged);
    } catch {
      return false;
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
