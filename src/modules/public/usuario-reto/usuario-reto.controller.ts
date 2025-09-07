// src/modules/public/usuario-reto/usuario-reto.controller.ts
import { Controller, Get, Patch, Query, Body, UseGuards, Post, Param, ParseIntPipe } from '@nestjs/common';
import { UsuarioRetoService } from './usuario-reto.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('mis-retos')
export class UsuarioRetoController {
  constructor(private readonly srv: UsuarioRetoService) {}

  // NUEVO: listar por día (lo que HomeScreen espera)
  @Get('dia')
  async dia(
    @CurrentUser() user: { sub: number },
    @Query('fecha') fecha?: string,
  ) {
    return this.srv.listarDia(user.sub, fecha);
  }

  @Get('listar')
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

  // === Resolución ===
  @Post('abrir')
  async abrir(
    @CurrentUser() user: { sub: number },
    @Body() body: { codReto: number }
  ) {
    return this.srv.abrirReto(user.sub, body.codReto);
  }

  @Post(':codUsuarioReto/quiz/responder')
  async responderQuiz(
    @CurrentUser() user: { sub: number },
    @Body() body: { codUsuarioReto: number; codPregunta: number; valor: any; tiempoSeg?: number }
  ) {
    return this.srv.responderQuiz(user.sub, body.codUsuarioReto, body.codPregunta, body.valor, body.tiempoSeg ?? null);
  }

  @Post(':codUsuarioReto/form/enviar')
  async enviarForm(
    @CurrentUser() user: { sub: number },
    @Body() body: { codUsuarioReto: number; codReto: number; data: any }
  ) {
    return this.srv.enviarFormulario(user.sub, body.codUsuarioReto, body.codReto, body.data);
  }

  @Post(':codUsuarioReto/finalizar')
  async finalizar(
    @CurrentUser() user: { sub: number },
    @Body() body: { codUsuarioReto: number }
  ) {
    return this.srv.finalizar(user.sub, body.codUsuarioReto);
  }

  // =========================================
  // NUEVO: USAR COMODÍN (descuenta inventario)
  // POST /mis-retos/:codUsuarioReto/comodines/usar
  // body: { codUsuarioReto, codPregunta?, tipo, segundos?, hasta? }
  // =========================================
  @Post(':codUsuarioReto/comodines/usar')
  async usarComodin(
    @CurrentUser() user: { sub: number },
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
    @Body() body: {
      codUsuarioReto?: number;
      codPregunta?: number | null;
      tipo: '50/50' | 'mas_tiempo' | 'protector_racha' | 'double' | 'ave_fenix';
      segundos?: number;
      hasta?: string;
    }
  ) {
    return this.srv.usarComodin(user.sub, codUsuarioReto, {
      codPregunta: body?.codPregunta ?? null,
      tipo: body.tipo,
      segundos: body?.segundos,
      hasta: body?.hasta,
    });
  }

    @Get(':codUsuarioReto/preguntas')
  async preguntas(
    @CurrentUser() user: { sub: number },
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number
  ) {
    return this.srv.preguntasDeUsuarioReto(user.sub, codUsuarioReto);
  }
}
