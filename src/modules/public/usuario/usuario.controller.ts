// src/modules/public/usuario/usuario.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from 'src/models/usuario/usuario';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('listar')
  listarUsuarios() {
    return this.usuarioService.listarUsuarios();
  }

  @Get(':codUsuario')
  buscarUsuario(@Param('codUsuario', ParseIntPipe) codUsuario: number) {
    return this.usuarioService.buscarUsuario(codUsuario);
  }

  @Post('crear')
  crearUsuario(@Body() objUsuario: Usuario) {
    return this.usuarioService.crearUsuario(objUsuario);
  }

  @Put('modificar')
  modificarUsuario(@Body() objActualizar: Usuario) {
    return this.usuarioService.modificarUsuario(objActualizar);
  }

  @Delete('borrar/:codUsuario')
  borrarUsuario(@Param('codUsuario', ParseIntPipe) codUsuario: number) {
    return this.usuarioService.borrarUsuario(codUsuario);
  }
}
