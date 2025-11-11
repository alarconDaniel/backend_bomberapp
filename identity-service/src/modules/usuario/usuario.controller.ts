// src/modules/usuario/usuario.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { ModificarUsuarioDto } from './dto/modificar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Usuarios')
@ApiBearerAuth('jwt-auth')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('listar')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Listado de usuarios' })
  listarUsuarios() {
    return this.usuarioService.listarUsuarios();
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener mis datos de usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  me(@CurrentUser('id') userId: number) {
    return this.usuarioService.buscarUsuario(userId);
  }

  @Get(':codUsuario')
  @ApiOperation({ summary: 'Buscar usuario por ID' })
  @ApiParam({ name: 'codUsuario', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  buscarUsuario(@Param('codUsuario', ParseIntPipe) codUsuario: number) {
    return this.usuarioService.buscarUsuario(codUsuario);
  }

  @Post('crear')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({ type: CrearUsuarioDto })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 409, description: 'Correo duplicado' })
  crearUsuario(@Body() dto: CrearUsuarioDto) {
    return this.usuarioService.crearUsuario(dto);
  }

  @Put('modificar')
  @ApiOperation({ summary: 'Modificar un usuario existente' })
  @ApiBody({ type: ModificarUsuarioDto })
  @ApiResponse({ status: 200, description: 'Usuario modificado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  modificarUsuario(@Body() dto: ModificarUsuarioDto) {
    return this.usuarioService.modificarUsuario(dto);
  }

  @Delete('borrar/:codUsuario')
  @ApiOperation({ summary: 'Borrar un usuario por ID' })
  @ApiParam({ name: 'codUsuario', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario borrado' })
  @ApiResponse({ status: 403, description: 'No puedes borrarte a ti mismo' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  borrarUsuario(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @CurrentUser('id') currentUserId: number,
  ) {
    if (Number.isFinite(currentUserId) && currentUserId === codUsuario) {
      throw new HttpException(
        'No puedes eliminar tu propio usuario',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.usuarioService.borrarUsuario(codUsuario);
  }
}
