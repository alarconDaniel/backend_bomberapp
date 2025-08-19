
import {
    Controller, Get, Post, Put, Delete,
    Param, Body, ParseIntPipe, 
  } from '@nestjs/common';
  import { RetoService } from './reto.service';
  import { Reto } from 'src/models/reto/reto';
  
  @Controller('reto')
  export class RetoController {
    constructor(private readonly retoService: RetoService) {}
  
    @Get('listar')
    public listarRetos(): Promise<Reto[]> {
      return this.retoService.listarRetos();
    }

  
    @Post('crear')
    public crearReto(@Body() objReto: Reto): Promise<Reto> {
      return this.retoService.crearReto(objReto);
    }
  
 
    @Put('modificar')
    public modificarReto(@Body() objActualizar: Reto) {
      return this.retoService.modificarReto(objActualizar);
    }
  
    
    @Delete('borrar/:codReto')
    public borrarReto(
      @Param('codReto', ParseIntPipe) codReto: number,
    ) {
      return this.retoService.borrarReto(codReto);
    }
  }
  