import { Body, Controller, Get, Post, BadRequestException } from '@nestjs/common';
import { ItemTiendaService } from './item-tienda.service';
import { ComprarItemDto } from 'src/modules/public/item-tienda/dto/comprar-item.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';

/**
 * Endpoints de la tienda de ítems (listado y compra).
 * Requiere usuario autenticado para poder personalizar el catálogo y registrar compras.
 */
@ApiBearerAuth('access-token') 
@ApiTags('ItemTienda')
@Controller('item-tienda')
export class ItemTiendaController {
  constructor(private readonly itemTiendaService: ItemTiendaService) {}

  /**
   * Devuelve el catálogo de ítems disponible para el usuario actual.
   * El servicio puede marcar si el usuario ya posee ciertos ítems y aplicar reglas de rotación.
   */
  @Get('listar')
  @ApiOperation({ summary: 'Listar ítems de la tienda para el usuario actual' })
  @ApiOkResponse({
    description: 'Listado de ítems disponible para el usuario autenticado.',
  })
  @ApiBadRequestResponse({ description: 'Usuario no autenticado o inválido.' })
  public listarItemsTienda(@CurrentUser('id') codUsuario: number): any {
    if (!codUsuario) throw new BadRequestException('Usuario no autenticado');
    return this.itemTiendaService.listarObjetos(codUsuario);
  }

  /**
   * Registra la compra de un ítem de la tienda por parte del usuario actual.
   * Valida el DTO y delega las reglas de negocio al servicio.
   */
  @Post('comprar')
  @ApiOperation({ summary: 'Comprar un ítem de la tienda' })
  @ApiOkResponse({
    description: 'Compra realizada correctamente (detalle según lógica de negocio).',
  })
  @ApiBadRequestResponse({ description: 'Datos de compra inválidos o saldo insuficiente.' })
  comprar(
    @Body() dto: ComprarItemDto,
    @CurrentUser('id') codUsuario: number,
  ) {
    return this.itemTiendaService.comprarItem(codUsuario, dto.codItem, dto.cantidad);
  }
}
