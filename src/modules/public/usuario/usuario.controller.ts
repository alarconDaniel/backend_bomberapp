import {
  Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsuarioService } from './usuario.service';
import { Usuario } from 'src/models/usuario/usuario';

@UseGuards(AuthGuard('jwt'))                 // 👈 protege TODO con JWT
@Controller('usuario')                       // → /api/usuario/*
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('listar')
  listarUsuarios() {
    return this.usuarioService.listarUsuarios();
  }

  // 👇 Conveniencia: datos del usuario autenticado (del token)
  @Get('me')
  me(@Req() req: Request) {
    const user: any = (req as any).user;     // <- viene de jwt.strategy.ts (validate)
    return this.usuarioService.buscarUsuario(Number(user?.sub));
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
