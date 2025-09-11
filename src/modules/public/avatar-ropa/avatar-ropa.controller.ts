// src/modules/avatar-ropa/avatar-ropa.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AvatarRopaService } from './avatar-ropa.service';
import { SaveAvatarDto } from './dto/save-avatar.dto';

@Controller('avatar/ropa')
export class AvatarRopaController {
  constructor(private readonly service: AvatarRopaService) {}

  // GET /avatar/ropa/equipada
  @Get('equipada')
  async getEquipada(@CurrentUser('id') codUsuario: number) {
    return this.service.getEquipada(codUsuario);
  }

  // POST /avatar/ropa/guardar
  @Post('guardar')
  async guardar(
    @CurrentUser('id') codUsuario: number,
    @Body() dto: SaveAvatarDto,
  ) {
    return this.service.guardar(codUsuario, dto);
  }
}
