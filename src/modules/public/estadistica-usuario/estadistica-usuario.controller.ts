import { Controller, Get } from '@nestjs/common';
import { EstadisticaUsuarioService } from './estadistica-usuario.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('mis-stats')
export class EstadisticaUsuarioController {

    constructor(private readonly statsService: EstadisticaUsuarioService){}

    @Get("listar")
    async listarStats(@CurrentUser() user: { sub: number }){
        return await this.statsService.listarMisStats(user.sub);
    } 
}
