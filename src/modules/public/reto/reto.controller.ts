import { Controller, Get } from '@nestjs/common';
import { RetoService } from './reto.service';

@Controller('reto')
export class RetoController {

    constructor(private readonly retoService: RetoService){};

    @Get("listar")
    public listarRetos():any{
        return this.retoService.listarRetos();
    }
}
