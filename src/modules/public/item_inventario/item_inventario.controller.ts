import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ItemInventarioService } from './item_inventario.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UsuarioService } from '../usuario/usuario.service';
import { AbrirCofreDto } from './dto/abrir-cofre.dto';


@Controller('item-inventario')
export class ItemInventarioController {

  constructor(private readonly usuarios: UsuarioService, private readonly service: ItemInventarioService) {

  }

  @Get('listar')
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

  @Post('abrir-cofre')
  public async abrirCofre(
    @Body() body: AbrirCofreDto,
    @CurrentUser('id') codUsuario: number
  ) {
    return this.service.abrirCofre(codUsuario, body.codItemInventario);
  }
  
  @Get(':cod')
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
    },
    usuario: {
      codUsuario: usuario?.codUsuario,
    },
  };
}


