// src/usuario/usuario.gateway.controller.ts
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
  Req,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';


import { mapAxiosError } from '../common/http-proxy.util';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

class CrearUsuarioDto {
  nombreUsuario!: string;
  apellidoUsuario!: string;
  cedulaUsuario!: string;
  nicknameUsuario?: string | null;
  correoUsuario!: string;
  contrasenaUsuario!: string;
  codRol!: number;
}

class ModificarUsuarioDto {
  codUsuario!: number;
  nombreUsuario?: string;
  apellidoUsuario?: string;
  cedulaUsuario?: string;
  nicknameUsuario?: string | null;
  correoUsuario?: string;
  contrasenaUsuario?: string;
  codRol?: number;
  tokenVersion?: number;
}

@ApiTags('Usuarios')
@ApiBearerAuth('jwt-auth')
@Controller('usuario')
export class UsuarioGatewayController {
  private readonly identityBase: string;

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {
    this.identityBase = this.cfg.get<string>('IDENTITY_URL') || 'http://localhost:8090';
  }

  @Get('listar')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  async listar(@Req() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.identityBase}/usuario/listar`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener mis datos de usuario' })
  async me(@Req() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.identityBase}/usuario/me`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get(':codUsuario')
  @ApiOperation({ summary: 'Buscar usuario por ID' })
  @ApiParam({ name: 'codUsuario', type: Number })
  async buscar(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Req() req: any,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.identityBase}/usuario/${codUsuario}`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Post('crear')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({ type: CrearUsuarioDto })
  async crear(@Body() dto: CrearUsuarioDto, @Req() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.identityBase}/usuario/crear`, dto, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Put('modificar')
  @ApiOperation({ summary: 'Modificar un usuario existente' })
  @ApiBody({ type: ModificarUsuarioDto })
  async modificar(@Body() dto: ModificarUsuarioDto, @Req() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.identityBase}/usuario/modificar`, dto, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Delete('borrar/:codUsuario')
  @ApiOperation({ summary: 'Borrar un usuario por ID' })
  @ApiParam({ name: 'codUsuario', type: Number })
  async borrar(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @CurrentUser('id') currentUserId: number,
    @Req() req: any,
  ) {
    if (Number.isFinite(currentUserId) && currentUserId === codUsuario) {
      throw new HttpException(
        'No puedes eliminar tu propio usuario',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const { data } = await firstValueFrom(
        this.http.delete(`${this.identityBase}/usuario/borrar/${codUsuario}`, {
          headers: { Authorization: req.headers['authorization'] || '' },
        }),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
