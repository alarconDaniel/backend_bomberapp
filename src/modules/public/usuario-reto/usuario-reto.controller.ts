// src/modules/public/usuario-reto/usuario-reto.controller.ts
import { Controller, Get, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { UsuarioRetoService } from './usuario-reto.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('mis-retos') // rutas “propiedad del usuario autenticado”
export class UsuarioRetoController {
  constructor(private readonly srv: UsuarioRetoService) {}

  @Get("listar")
  async listar(
    @CurrentUser() user: { sub: number },
    @Query('estado') estado?: 'pendiente'|'asignado'|'en_progreso'|'completado'|'abandonado'|'vencido',
  ) {
    return this.srv.listarMisRetos(user.sub, estado);
  }

  @Get('resumen')
  async resumen(@CurrentUser() user: { sub: number }) {
    return this.srv.resumenMisRetos(user.sub);
  }

  @Patch('estado')
  async cambiarEstado(
    @CurrentUser() user: { sub: number },
    @Body() body: { codReto: number; estado: 'asignado'|'en_progreso'|'completado'|'abandonado'|'vencido' },
  ) {
    return this.srv.marcarEstado(user.sub, body.codReto, body.estado);
  }
}
