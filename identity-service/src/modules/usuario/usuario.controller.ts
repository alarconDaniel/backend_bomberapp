// src/modules/usuario/usuario.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UsuarioService } from './usuario.service';
import { ModificarUsuarioDto } from './dto/modificar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';
const SELF_DELETE_FORBIDDEN_MESSAGE = 'No puedes eliminar tu propio usuario';

/**
 * Controller responsible for user management operations:
 * listing, retrieving, creating, updating and deleting users.
 */
@ApiTags('Usuarios')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('listar')
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'List of users returned successfully' })
  listarUsuarios() {
    return this.usuarioService.listarUsuarios();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get data for the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user found' })
  me(@CurrentUser('id') userId: number) {
    return this.usuarioService.buscarUsuario(userId);
  }

  @Get(':codUsuario')
  @ApiOperation({ summary: 'Find a user by its identifier' })
  @ApiParam({ name: 'codUsuario', type: Number })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  buscarUsuario(@Param('codUsuario', ParseIntPipe) codUsuario: number) {
    return this.usuarioService.buscarUsuario(codUsuario);
  }

  @Post('crear')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CrearUsuarioDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  crearUsuario(@Body() dto: CrearUsuarioDto) {
    return this.usuarioService.crearUsuario(dto);
  }

  @Put('modificar')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiBody({ type: ModificarUsuarioDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  modificarUsuario(@Body() dto: ModificarUsuarioDto) {
    return this.usuarioService.modificarUsuario(dto);
  }

  @Delete('borrar/:codUsuario')
  @ApiOperation({ summary: 'Delete a user by its identifier' })
  @ApiParam({ name: 'codUsuario', type: Number })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'You cannot delete your own user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  borrarUsuario(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @CurrentUser('id') currentUserId: number,
  ) {
    if (Number.isFinite(currentUserId) && currentUserId === codUsuario) {
      // Prevent the currently authenticated user from deleting itself.
      throw new HttpException(
        SELF_DELETE_FORBIDDEN_MESSAGE,
        HttpStatus.FORBIDDEN,
      );
    }

    return this.usuarioService.borrarUsuario(codUsuario);
  }
}
