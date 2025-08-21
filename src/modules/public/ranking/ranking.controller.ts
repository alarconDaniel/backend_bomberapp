// src/modules/public/ranking/ranking.controller.ts
import { Controller, Get, NotFoundException } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RankingService } from './ranking.service';
import { UsuarioService } from '../usuario/usuario.service';

@Controller('ranking')
export class RankingController {
  constructor(
    private readonly ranking: RankingService,
    private readonly usuarios: UsuarioService, // ⬅️ como Perfil
  ) {}

  @Get('resumen')
  async resumen(@CurrentUser('id') codUsuario: number) {
    const user = await this.usuarios.findById(codUsuario);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const cargo = user.cargo?.nombreCargo ?? 'Operario';

    const top = await this.ranking.topXP(5);
    const me = await this.ranking.posicionUsuario(codUsuario);
    const trofeos = await this.ranking.listarTrofeos();

    let mensaje: string;
    if (me.position === 1) {
      mensaje = 'Dicen que la cima es solitaria… pero no te dejes comer la cabeza. ¡Eres el #1 por una razón! 💥';
    } else if (me.position <= 5) {
      mensaje = 'Perfecto hasta ahora. ¿Crees poder llegar a la cima? 🔥';
    } else {
      mensaje = `Eres rango #${me.position}. ¡Esfuérzate más, mi ${cargo}! 🚀`;
    }

    return { top, me, mensaje, trofeos };
  }
}
