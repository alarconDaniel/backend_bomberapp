// src/modules/avatar-ropa/avatar-ropa.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AvatarRopaService } from './avatar-ropa.service';
import { SaveAvatarDto } from './dto/save-avatar.dto';

/**
 * Controlador para gestionar la “ropa” del avatar de un usuario.
 * Expone endpoints para leer y guardar la configuración de items equipados.
 */
@ApiTags('Avatar - Ropa')
@ApiBearerAuth('access-token') 
@Controller('avatar/ropa')
export class AvatarRopaController {
  constructor(private readonly service: AvatarRopaService) {}

  /**
   * Devuelve la configuración de ropa actualmente equipada por el usuario.
   * Usa el ID del usuario autenticado (JWT) para resolver su avatar.
   */
  @Get('equipada')
  @ApiOperation({ summary: 'Obtener ropa equipada del avatar' })
  @ApiOkResponse({
    description: 'Configuración de slots de ropa actualmente equipada.',
  })
  async getEquipada(@CurrentUser('id') codUsuario: number) {
    return this.service.getEquipada(codUsuario);
  }

  /**
   * Guarda la configuración de ropa del avatar.
   * Reemplaza los items equipados en los distintos slots (cabeza, torso, etc.).
   */
  @Post('guardar')
  @ApiOperation({ summary: 'Guardar configuración de ropa del avatar' })
  @ApiBody({ type: SaveAvatarDto })
  @ApiOkResponse({
    description: 'Configuración de avatar guardada correctamente.',
  })
  async guardar(
    @CurrentUser('id') codUsuario: number,
    @Body() dto: SaveAvatarDto,
  ) {
    return this.service.guardar(codUsuario, dto);
  }
}
