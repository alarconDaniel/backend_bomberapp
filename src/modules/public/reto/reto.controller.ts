import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RetoService } from './reto.service';

@UseGuards(AuthGuard('jwt'))
@Controller('reto')
export class RetoController {
  constructor(private readonly svc: RetoService) {}

  @Get('listar')
  listar() {
    return this.svc.listar();
  }

  @Get(':codReto')
  detalle(@Param('codReto', ParseIntPipe) codReto: number) {
    return this.svc.detalle(codReto);
  }

  @Post('crear')
  crear(@Req() req: Request, @Body() body: any) {
    const u = (req as any).user;
    console.log('[Reto][crear] req.user =', u);
    if (!isAdmin(u)) {
      throw new ForbiddenException('Solo admin puede crear retos');
    }
    return this.svc.crear(body);
  }

  @Delete('borrar/:codReto')
  borrar(@Req() req: Request, @Param('codReto', ParseIntPipe) codReto: number) {
    const u = (req as any).user;
    console.log('[Reto][borrar] req.user =', u, 'codReto =', codReto);
    if (!isAdmin(u)) {
      throw new ForbiddenException('Solo admin puede borrar retos');
    }
    return this.svc.borrar(codReto);
  }
}

/** Helper robusto que acepta múltiples formas de rol en el JWT */
function isAdmin(user: any): boolean {
  if (!user) return false;

  // 1) Campos "planos"
  const flat = [
    user.rol,
    user.role,
    user.roleId,
    user.rolId,
    user.codRol,
    user.cod_rol,
    user.idRol,
    user.id_rol,
    user.nombreRol,
    user.nombre_rol,
    user.perfil,
    user.isAdmin,
  ].filter(v => v !== undefined && v !== null);

  for (const v of flat) {
    if (v === true || v === 1) return true;
    const s = String(v).trim().toLowerCase();
    if (s === 'admin' || s === 'administrador' || s === '1') return true;
    const n = Number(s);
    if (!Number.isNaN(n) && n === 1) return true;
  }

  // 2) Objeto anidado: { rol|role: { id, name|nombre } }
  const nested = user.rol || user.role;
  if (nested) {
    const name = String(nested.name ?? nested.nombre ?? '').trim().toLowerCase();
    const id = Number(nested.id ?? nested.codRol ?? nested.cod_rol);
    if (name === 'admin' || name === 'administrador' || id === 1) return true;
  }

  // 3) Arreglo de roles
  if (Array.isArray(user.roles)) {
    for (const r of user.roles) {
      const name = String((r && (r.name ?? r.nombre)) ?? r).trim().toLowerCase();
      const id = Number(r?.id ?? r?.codRol ?? r?.cod_rol);
      if (name === 'admin' || name === 'administrador' || id === 1) return true;
    }
  }

  return false;
}
