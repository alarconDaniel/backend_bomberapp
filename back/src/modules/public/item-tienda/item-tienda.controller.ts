import { Body, Controller, Get, Post, BadRequestException } from '@nestjs/common';
import { ItemTiendaService } from './item-tienda.service';
import { ComprarItemDto } from 'src/modules/public/item-tienda/dto/comprar-item.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('item-tienda')
export class ItemTiendaController {
  constructor(private readonly itemTiendaService: ItemTiendaService) {}

  // Ahora requiere usuario para poder marcar yaPosee y aplicar la rotación de ropa
  @Get('listar')
  public listarItemsTienda(@CurrentUser('id') codUsuario: number): any {
    if (!codUsuario) throw new BadRequestException('Usuario no autenticado');
    return this.itemTiendaService.listarObjetos(codUsuario);
  }

  @Post('comprar')
  comprar(@Body() dto: ComprarItemDto, @CurrentUser('id') codUsuario: number) {
    return this.itemTiendaService.comprarItem(codUsuario, dto.codItem, dto.cantidad);
  }
}
