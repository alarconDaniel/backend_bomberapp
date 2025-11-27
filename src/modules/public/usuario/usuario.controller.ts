import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ModificarUsuarioDto } from './dto/modificar-usuario.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token') 
@ApiTags('Usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('listar')
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Devuelve el listado completo de usuarios registrados en el sistema.',
  })
  @ApiOkResponse({
    description: 'Listado obtenido correctamente.',
  })
  listarUsuarios() {
    return this.usuarioService.listarUsuarios();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Obtener mi usuario',
    description: 'Devuelve la información del usuario autenticado según el token JWT.',
  })
  @ApiOkResponse({
    description: 'Información del usuario autenticado.',
  })
  me(@Req() req: Request) {
    const user: any = (req as any).user;
    return this.usuarioService.buscarUsuario(Number(user?.sub));
  }

  @Get(':codUsuario')
  @ApiOperation({
    summary: 'Buscar usuario por ID',
    description: 'Obtiene los datos de un usuario específico por su identificador interno.',
  })
  @ApiParam({
    name: 'codUsuario',
    type: Number,
    description: 'Identificador interno del usuario.',
    example: 42,
  })
  @ApiOkResponse({
    description: 'Usuario encontrado.',
  })
  buscarUsuario(@Param('codUsuario', ParseIntPipe) codUsuario: number) {
    return this.usuarioService.buscarUsuario(codUsuario);
  }

  @Post('crear')
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Crea un nuevo usuario con rol y cargo opcional.',
  })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente.',
  })
  crearUsuario(@Body() dto: CrearUsuarioDto) {
    // DTO + ValidationPipe(whitelist:true) → evita campos extra y mantiene codRol/codCargoUsuario
    return this.usuarioService.crearUsuario(dto);
  }

  @Put('modificar')
  @ApiOperation({
    summary: 'Modificar usuario',
    description: 'Actualiza parcialmente los datos de un usuario existente.',
  })
  @ApiOkResponse({
    description: 'Usuario modificado correctamente.',
  })
  modificarUsuario(@Body() dto: ModificarUsuarioDto) {
    return this.usuarioService.modificarUsuario(dto);
  }

  @Delete('borrar/:codUsuario')
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario por ID, evitando que alguien se auto-elimine.',
  })
  @ApiParam({
    name: 'codUsuario',
    type: Number,
    description: 'Identificador interno del usuario a eliminar.',
    example: 99,
  })
  @ApiOkResponse({
    description: 'Usuario eliminado correctamente.',
  })
  borrarUsuario(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Req() req: Request,
  ) {
    const currentUserId = Number((req as any)?.user?.sub);

    // Seguridad extra: impedir que un usuario borre su propio registro
    if (Number.isFinite(currentUserId) && currentUserId === codUsuario) {
      throw new HttpException(
        'No puedes eliminar tu propio usuario',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.usuarioService.borrarUsuario(codUsuario);
  }
}
