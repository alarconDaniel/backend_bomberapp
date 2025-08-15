import { Controller } from '@nestjs/common';
import { ItemTiendaService } from './item-tienda.service';
import { Get } from '@nestjs/common';

@Controller('item-tienda')
export class ItemTiendaController {

    constructor(private readonly itemTiendaService: ItemTiendaService){};

    @Get("listar")
    public listarItemsTienda():any{
        return this.itemTiendaService.listarObjetos();
    };
}
