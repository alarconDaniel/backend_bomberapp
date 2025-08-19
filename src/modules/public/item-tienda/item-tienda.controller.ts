import { Body, Controller, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ItemTiendaService } from './item-tienda.service';
import { Get } from '@nestjs/common';
import { ComprarItemDto } from 'src/modules/public/item-tienda/dto/comprar-item.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('item-tienda')
export class ItemTiendaController {

    constructor(private readonly itemTiendaService: ItemTiendaService) { };

    @Get("listar")
    public listarItemsTienda(): any {
        return this.itemTiendaService.listarObjetos();
    };

    @Post('comprar')
    comprar(@Body() dto: ComprarItemDto, @CurrentUser('id') codUsuario: number) {
        return this.itemTiendaService.comprarItem(codUsuario, dto.codItem, dto.cantidad);
    }
}
