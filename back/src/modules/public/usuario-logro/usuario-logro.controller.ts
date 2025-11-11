// src/modules/public/usuario-logro/usuario-logro.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UsuarioLogroService } from './usuario-logro.service';

@Controller('mis-logros')
export class UsuarioLogroController {
  constructor(private readonly svc: UsuarioLogroService) {}

  @Get('ultimos')
  async ultimos(@CurrentUser('id') codUsuario: number, @Query('limit') limit?: string) {
    const n = Math.max(1, Math.min(Number(limit ?? 2), 10));
    return this.svc.ultimosDelUsuario(codUsuario, n);
  }

  @Get('todos')
  async todos(@CurrentUser('id') codUsuario: number) {
    return this.svc.todosConEstado(codUsuario);
  }
}
