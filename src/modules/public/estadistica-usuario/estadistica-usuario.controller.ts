import { Controller, Get, Post } from '@nestjs/common';
import { EstadisticaUsuarioService } from './estadistica-usuario.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RachaCron } from './racha.cron';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('mis-stats')
@ApiBearerAuth('access-token') 
@Controller('mis-stats')
export class EstadisticaUsuarioController {

  constructor(
    private readonly statsService: EstadisticaUsuarioService,
    private readonly rachaCron: RachaCron,
  ) {}

  /**
   * Devuelve las estadísticas del usuario autenticado
   * (monedas, racha, XP, etc.).
   */
  @Get('listar')
  @ApiOperation({
    summary: 'Listar mis estadísticas',
    description: 'Obtiene las estadísticas asociadas al usuario autenticado (monedas, racha, XP, etc.).',
  })
  @ApiOkResponse({
    description: 'Estadísticas actuales del usuario.',
  })
  async listarStats(@CurrentUser() user: { sub: number }) {
    return await this.statsService.listarMisStats(user.sub);
  }

  /**
   * Endpoint de prueba para disparar manualmente el cron
   * que resetea la racha si no hubo actividad ayer.
   */
  @Post('test-reset')
  @ApiOperation({
    summary: 'Forzar cron de racha (solo pruebas)',
    description: 'Ejecuta manualmente la lógica que resetea la racha si no hubo actividad el día anterior.',
  })
  @ApiOkResponse({
    description: 'Cron ejecutado exitosamente.',
    schema: {
      example: { message: 'Cron ejecutado manualmente' },
    },
  })
  async testReset() {
    await this.rachaCron.resetSiNoHuboAyer();
    return { message: 'Cron ejecutado manualmente' };
  }
}
