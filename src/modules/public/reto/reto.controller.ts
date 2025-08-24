import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { RetoService } from './reto.service';

@Controller('reto')
export class RetoController {
  constructor(private readonly svc: RetoService) {}

  @Get('listar')
  listar() {
    return this.svc.listar(); // ← devuelve ARRAY directo (tu front ya lo espera)
  }

  @Post('crear')
  crear(@Body() body: any) {
    return this.svc.crear(body);
  }

  @Delete('borrar/:codReto')
  borrar(@Param('codReto', ParseIntPipe) codReto: number) {
    return this.svc.borrar(codReto);
  }
}
