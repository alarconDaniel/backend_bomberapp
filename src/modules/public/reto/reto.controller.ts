import { Controller, Get, Param } from '@nestjs/common';
import { RetoService } from './reto.service';

@Controller('reto')
export class RetoController {

    constructor(private readonly retoService: RetoService){};

    @Get("listar")
    public listarRetos():any{
        return this.retoService.listarRetos();
    }

    @Get("ver/:cod")
    public verReto(@Param('cod')cod: string):any{
        return this.retoService.verReto(Number(cod));
    }

}
