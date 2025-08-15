import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ItemInventarioService } from './item-inventario.service';

@Controller('item-inventario')
export class ItemInventarioController {
  constructor(private readonly service: ItemInventarioService) {}

  @Get('listar')
  public listar(): any {
    return this.service.listar();
  }

  @Get(':id')
  public obtenerPorId(@Param('id', ParseIntPipe) id: number): any {
    return this.service.obtenerPorId(id);
  }

  @Get('usuario/:cod_usuario')
  public listarPorUsuario(@Param('cod_usuario', ParseIntPipe) codUsuario: number): any {
    return this.service.listarPorUsuario(codUsuario);
  }

  @Post('crear')
  public crear(@Body() body: any): any {
    return this.service.crear(body);
  }

  @Put(':id')
  public actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any): any {
    return this.service.actualizar(id, body);
  }

  @Delete(':id')
  public eliminar(@Param('id', ParseIntPipe) id: number): any {
    return this.service.eliminar(id);
  }
}
