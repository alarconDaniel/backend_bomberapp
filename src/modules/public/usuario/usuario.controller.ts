import {
  Controller, Get, Post, Put, Delete,
  Param, Body, ParseIntPipe, UseGuards, Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ModificarUsuarioDto } from './dto/modificar-usuario.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('usuario') // con globalPrefix('api') => /api/usuario/*
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('listar')
  listarUsuarios() {
    return this.usuarioService.listarUsuarios();
  }

  @Get('me')
  me(@Req() req: Request) {
    const user: any = (req as any).user;
    return this.usuarioService.buscarUsuario(Number(user?.sub));
  }

  @Get(':codUsuario')
  buscarUsuario(@Param('codUsuario', ParseIntPipe) codUsuario: number) {
    return this.usuarioService.buscarUsuario(codUsuario);
  }

  @Post('crear')
  crearUsuario(@Body() dto: CrearUsuarioDto) {
    // ⚠️ Al usar DTO + ValidationPipe(whitelist:true), ya no se “pierde” codRol
    return this.usuarioService.crearUsuario(dto);
  }

  @Put('modificar')
  modificarUsuario(@Body() dto: ModificarUsuarioDto) {
    return this.usuarioService.modificarUsuario(dto);
  }

  @Delete('borrar/:codUsuario')
  borrarUsuario(@Param('codUsuario', ParseIntPipe) codUsuario: number) {
    return this.usuarioService.borrarUsuario(codUsuario);
  }
}
