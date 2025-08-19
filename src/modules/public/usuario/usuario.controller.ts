import {
    Controller, Get,Post,Put,Delete,Param,Body,ParseIntPipe, } from '@nestjs/common';
  import { UsuarioService } from './usuario.service';
  import { Usuario } from 'src/models/usuario/usuario';
  
  @Controller('usuario')
  export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) {}
  
    // GET: listar todos
    @Get('listar')
    public listarUsuarios(): Promise<Usuario[]> {
      return this.usuarioService.listarUsuarios();
    }
  
    // GET: detalle por id
    @Get(':codUsuario')
    public buscarUsuario(
      @Param('codUsuario', ParseIntPipe) codUsuario: number,
    ): Promise<Usuario> {
      return this.usuarioService.buscarUsuario(codUsuario);
    }
  
    // POST: crear
    @Post('crear')
    public crearUsuario(@Body() objUsuario: Usuario): Promise<Usuario> {
      return this.usuarioService.crearUsuario(objUsuario);
    }
  
    // PUT: modificar
    @Put('modificar')
    public modificarUsuario(@Body() objActualizar: Usuario) {
      return this.usuarioService.modificarUsuario(objActualizar);
    }
  
    // DELETE: borrar
    @Delete('borrar/:codUsuario')
    public borrarUsuario(
      @Param('codUsuario', ParseIntPipe) codUsuario: number,
    ) {
      return this.usuarioService.borrarUsuario(codUsuario);
    }
  }
  