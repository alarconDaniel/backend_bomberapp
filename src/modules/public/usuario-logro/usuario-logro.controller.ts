// src/modules/public/usuario-logro/usuario-logro.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UsuarioLogroService } from './usuario-logro.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('Mis logros')
@ApiBearerAuth('access-token') 
@Controller('mis-logros')
export class UsuarioLogroController {
  constructor(private readonly svc: UsuarioLogroService) {}

  /**
   * Devuelve los últimos N logros obtenidos por el usuario autenticado.
   * Se usa para widgets / tarjetas cortas de “actividad reciente”.
   */
  @Get('ultimos')
  @ApiOperation({
    summary: 'Últimos logros del usuario',
    description:
      'Devuelve los últimos logros obtenidos por el usuario autenticado. El parámetro `limit` controla cuántos se devuelven (por defecto 2, máximo 10).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de logros recientes a devolver (1–10, por defecto 2).',
    example: 3,
  })
  @ApiOkResponse({
    description:
      'Lista de logros recientes del usuario autenticado, ordenados del más nuevo al más antiguo.',
  })
  async ultimos(
    @CurrentUser('id') codUsuario: number,
    @Query('limit') limit?: string,
  ) {
    // Aseguramos un rango razonable: mínimo 1, máximo 10
    const n = Math.max(1, Math.min(Number(limit ?? 2), 10));
    return this.svc.ultimosDelUsuario(codUsuario, n);
  }

  /**
   * Devuelve todos los logros del usuario junto con su estado
   * (bloqueado, desbloqueado, obtenido, etc. según la implementación del service).
   */
  @Get('todos')
  @ApiOperation({
    summary: 'Todos los logros del usuario',
    description:
      'Devuelve el listado completo de logros asociados al usuario autenticado, incluyendo su estado actual.',
  })
  @ApiOkResponse({
    description:
      'Lista completa de logros del usuario con su estado. El formato exacto depende del UsuarioLogroService.',
  })
  async todos(@CurrentUser('id') codUsuario: number) {
    return this.svc.todosConEstado(codUsuario);
  }
}
