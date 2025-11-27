import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ItemInventarioService } from './item_inventario.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UsuarioService } from '../usuario/usuario.service';
import { AbrirCofreDto } from './dto/abrir-cofre.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Item Inventario')
@ApiBearerAuth('access-token') 
@Controller('item-inventario')
export class ItemInventarioController {
  constructor(
    private readonly usuarios: UsuarioService,
    private readonly service: ItemInventarioService,
  ) {}

  /**
   * Lista los ítems de inventario del usuario autenticado
   * y los normaliza a un formato de respuesta estable.
   */
  @Get('listar')
  @ApiOperation({
    summary: 'Listar ítems del inventario del usuario actual',
    description:
      'Devuelve todos los ítems del inventario del usuario autenticado en un formato ya mapeado para frontend.',
  })
  @ApiOkResponse({
    description: 'Listado de ítems del inventario del usuario.',
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  public async listar(@CurrentUser('id') codUsuario: number) {
    const user = await this.usuarios.findById(codUsuario);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 👇 devuelve ItemInventario[]
    const rows = await this.service.listarMisItems(codUsuario);

    // Map bonito y seguro
    const data = rows.map(mapItemInventarioToResponse);

    return {
      usuario: { codUsuario },
      items: data,
      total: data.length,
    };
  }

  /**
   * Abre un cofre del inventario del usuario y aplica la lógica de recompensa.
   */
  @Post('abrir-cofre')
  @ApiOperation({
    summary: 'Abrir un cofre del inventario',
    description:
      'Recibe el ID de un ítem de tipo cofre en el inventario del usuario y delega la lógica de apertura al servicio.',
  })
  @ApiBody({
    type: AbrirCofreDto,
    description: 'Datos necesarios para abrir un cofre del inventario.',
  })
  @ApiOkResponse({
    description: 'Cofre abierto correctamente. La respuesta depende de la lógica del servicio.',
  })
  public async abrirCofre(
    @Body() body: AbrirCofreDto,
    @CurrentUser('id') codUsuario: number,
  ) {
    return this.service.abrirCofre(codUsuario, body.codItemInventario);
  }

  /**
   * Obtiene información de un ítem de inventario por su identificador interno.
   */
  @Get(':cod')
  @ApiOperation({
    summary: 'Obtener ítem de inventario por código',
    description:
      'Devuelve la información cruda del registro de inventario asociado al código indicado.',
  })
  @ApiParam({
    name: 'cod',
    type: Number,
    description: 'Identificador del ítem de inventario.',
  })
  @ApiOkResponse({
    description: 'Ítem de inventario encontrado.',
  })
  public obtenerPorCodigoItem(@Param('cod', ParseIntPipe) id: number): any {
    return this.service.obtenerPorId(id);
  }

  //   @Get('usuario/:cod_usuario')
  //   public listarPorUsuario(@Param('cod_usuario', ParseIntPipe) codUsuario: number): any {
  //     return this.service.listarPorUsuario(codUsuario);
  //   }

  //   @Post('crear')
  //   public crear(@Body() body: any): any {
  //     return this.service.crear(body);
  //   }

  //   @Put(':id')
  //   public actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any): any {
  //     return this.service.actualizar(id, body);
  //   }

  //   @Delete(':id')
  //   public eliminar(@Param('id', ParseIntPipe) id: number): any {
  //     return this.service.eliminar(id);
  //   }
}

function mapItemInventarioToResponse(row: any) {
  const {
    codItemInventario,
    cantidad,
    fechaCompra,
    usuario,
    item, 
  } = row;

  // Normaliza la entidad de BD a un objeto plano pensado para el frontend.
  return {
    cod: codItemInventario,
    cantidad,
    fecha: fechaCompra,
    item: {
      codItem: item?.codItem,
      nombre: item?.nombreItem,
      descripcion: item?.desripcionItem,
      tipo: item?.tipoItem,
      icon: item?.iconoItem,
      slot: item?.slotItem ?? null,
    },
    usuario: {
      codUsuario: usuario?.codUsuario,
    },
  };
}
