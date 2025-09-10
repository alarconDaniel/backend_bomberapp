import { Controller, Get, Post } from '@nestjs/common';
import { EstadisticaUsuarioService } from './estadistica-usuario.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RachaCron } from './racha.cron';

@Controller('mis-stats')
export class EstadisticaUsuarioController {

    constructor(private readonly statsService: EstadisticaUsuarioService, private readonly rachaCron: RachaCron) { }

    @Get("listar")
    async listarStats(@CurrentUser() user: { sub: number }) {
        return await this.statsService.listarMisStats(user.sub);
    }

    @Post('test-reset')
    async testReset() {
        await this.rachaCron.resetSiNoHuboAyer();
        return { message: 'Cron ejecutado manualmente' };
    }
}
