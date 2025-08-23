import {
  Controller, Get, Post, Put, Delete,
  Param, Body, ParseIntPipe,
  NotFoundException, InternalServerErrorException, ConflictException
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from 'src/models/usuario/usuario';

type UsuarioUI = {
  codUsuario: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  correoUsuario: string;
  cargoUsuario: string; // tu app lo usa
  codRol: number;       // tu app lo usa
};

function toUI(u: Partial<Usuario>): UsuarioUI {
  return {
    codUsuario: u.codUsuario!,
    nombreUsuario: u.nombreUsuario ?? '',
    apellidoUsuario: u.apellidoUsuario ?? '',
    correoUsuario: u.correoUsuario ?? '',
    cargoUsuario: 'Operario', // valor por defecto por ahora
    codRol: 0,                // placeholder
  };
}

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('listar')
  public async listarUsuarios(): Promise<UsuarioUI[]> {
    try {
      const rows = await this.usuarioService.listarUsuarios();
      return rows.map(toUI);
    } catch {
      throw new InternalServerErrorException('No se pudo listar usuarios');
    }
  }

  @Get(':codUsuario')
  public async buscarUsuario(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
  ): Promise<UsuarioUI> {
    const u = await this.usuarioService.buscarUsuario(codUsuario);
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return toUI(u);
  }

  @Post('crear')
  public async crearUsuario(@Body() objUsuario: Usuario): Promise<UsuarioUI> {
    try {
      const u = await this.usuarioService.crearUsuario(objUsuario);
      return toUI(u);
    } catch (e: any) {
      if (e?.status === 409) throw new ConflictException(e.message || 'Duplicado');
      throw e;
    }
  }

  @Put('modificar')
  public async modificarUsuario(@Body() objActualizar: Usuario): Promise<UsuarioUI> {
    try {
      const u = await this.usuarioService.modificarUsuario(objActualizar);
      return toUI(u);
    } catch (e: any) {
      if (e?.status === 409) throw new ConflictException(e.message || 'Duplicado');
      throw e;
    }
  }

  @Delete('borrar/:codUsuario')
  public async borrarUsuario(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
  ) {
    return this.usuarioService.borrarUsuario(codUsuario);
  }
}
