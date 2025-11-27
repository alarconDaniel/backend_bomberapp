// src/modules/public/ranking/ranking.controller.ts
import { Controller, Get, NotFoundException } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RankingService } from './ranking.service';
import { UsuarioService } from '../usuario/usuario.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Ranking')
@ApiBearerAuth('access-token') 
@Controller('ranking')
export class RankingController {
  constructor(
    private readonly ranking: RankingService,
    private readonly usuarios: UsuarioService, 
  ) {}

  /**
   * Devuelve el resumen de ranking para el usuario autenticado:
   * - top global por XP
   * - posición del usuario
   * - mensaje motivacional
   * - trofeos asociados al ranking
   */
  @Get('resumen')
  @ApiOperation({
    summary: 'Obtener resumen de ranking del usuario',
    description:
      'Devuelve el top global por XP, la posición del usuario autenticado, un mensaje motivacional y los trofeos relacionados.',
  })
  @ApiOkResponse({
    description:
      'Resumen de ranking con top global, posición del usuario, mensaje y trofeos actuales.',
  })
  async resumen(@CurrentUser('id') codUsuario: number) {
    const user = await this.usuarios.findById(codUsuario);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const cargo = user.cargo?.nombreCargo ?? 'Operario';

    const top = await this.ranking.topXP(5);
    const me = await this.ranking.posicionUsuario(codUsuario);
    const trofeos = await this.ranking.listarTrofeos();

    let mensaje: string;
    if (me.position === 1) {
      mensaje =
        'Dicen que la cima es solitaria… pero no te dejes comer la cabeza. ¡Eres el #1 por una razón! 💥';
    } else if (me.position <= 5) {
      mensaje = 'Perfecto hasta ahora. ¿Crees poder llegar a la cima? 🔥';
    } else {
      mensaje = `Eres rango #${me.position}. ¡Esfuérzate más, mi ${cargo}! 🚀`;
    }

    return { top, me, mensaje, trofeos };
  }
}
