// src/modules/public/reto/reto.controller.ts
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post,
  UseGuards, Req, ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RetoService } from './reto.service';

@UseGuards(AuthGuard('jwt'))       // ⬅️ igual que en UsuarioController: todo requiere JWT
@Controller('reto')                // => /api/reto/*
export class RetoController {
  constructor(private readonly svc: RetoService) {}

  // Autenticado (admin u operario)
  @Get('listar')
  listar() {
    return this.svc.listar();
  }

  // Autenticado (admin u operario)
  @Get(':codReto')
  detalle(@Param('codReto', ParseIntPipe) codReto: number) {
    return this.svc.detalle(codReto);
  }

  // Solo admin (chequeo simple sin guards adicionales)
  @Post('crear')
  crear(@Req() req: Request, @Body() body: any) {
    if (!isAdmin((req as any).user)) {
      throw new ForbiddenException('Solo admin puede crear retos');
    }
    return this.svc.crear(body);
  }

  // Solo admin (chequeo simple sin guards adicionales)
  @Delete('borrar/:codReto')
  borrar(@Req() req: Request, @Param('codReto', ParseIntPipe) codReto: number) {
    if (!isAdmin((req as any).user)) {
      throw new ForbiddenException('Solo admin puede borrar retos');
    }
    return this.svc.borrar(codReto);
  }
}

// Helper minimalista (usa lo que ya trae tu JWT: rol o codRol)
function isAdmin(user: any): boolean {
  if (!user) return false;
  if (typeof user.rol === 'string') return user.rol === 'admin';
  if (typeof user.codRol === 'number') return user.codRol === 1; // ajusta si tu mapeo difiere
  return false;
}
