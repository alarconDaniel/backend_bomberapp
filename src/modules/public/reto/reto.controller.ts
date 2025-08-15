// src/modules/public/reto/reto.controller.ts
import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query,
    ParseIntPipe, DefaultValuePipe
  } from '@nestjs/common';
  import { RetoService } from './reto.service';
  import { Reto } from 'src/models/reto/reto';
  
  @Controller('reto')
  export class RetoController {
    constructor(private readonly retoService: RetoService) {}
  
    // GET: listar todos
    @Get('listar')
    public listarRetos(): Promise<Reto[]> {
      return this.retoService.listarRetos();
    }
  
    // GET: paginado y búsqueda
    // /reto/paginado?page=1&limit=5&search=prueba
    @Get('paginado')
    public listarPaginado(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('search') search?: string,
    ): Promise<{ data: Reto[]; total: number; page: number; limit: number }> {
      return this.retoService.listarPaginado(page, limit, search);
    }
  
    // GET: buscar por ID
    @Get(':codReto')
    public buscarReto(
      @Param('codReto', ParseIntPipe) codReto: number,
    ): Promise<Reto> {
      return this.retoService.buscarReto(codReto);
    }
  
    // POST: crear nuevo reto
    @Post('crear')
    public crearReto(@Body() objReto: Reto): Promise<Reto> {
      return this.retoService.crearReto(objReto);
    }
  
    // PUT: modificar reto existente
    @Put('modificar')
    public modificarReto(@Body() objActualizar: Reto) {
      return this.retoService.modificarReto(objActualizar);
    }
  
    // DELETE: borrar reto por ID
    @Delete('borrar/:codReto')
    public borrarReto(
      @Param('codReto', ParseIntPipe) codReto: number,
    ) {
      return this.retoService.borrarReto(codReto);
    }
  }
  