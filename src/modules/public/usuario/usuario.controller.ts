// src/modules/public/usuario/usuario.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarios: UsuarioService) {}

  // Protegido por el guard global (solo admins deberían llamarlo)
  @Post()
  async crear(@Body() dto: CrearUsuarioDto) {
    return this.usuarios.crearUsuario(dto);
  }
}
