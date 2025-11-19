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

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { mapAxiosError } from '../common/http-proxy.util';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

const IDENTITY_URL_CONFIG_KEY = 'IDENTITY_URL';
const DEFAULT_IDENTITY_BASE_URL = 'http://localhost:8090';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

/**
 * DTO used to describe the payload required to create a user.
 * This class is used for documentation purposes at the gateway level.
 */
class CrearUsuarioDto {
  nombreUsuario!: string;
  apellidoUsuario!: string;
  cedulaUsuario!: string;
  nicknameUsuario?: string | null;
  correoUsuario!: string;
  contrasenaUsuario!: string;
  codRol!: number;
}

/**
 * DTO used to describe the payload required to modify an existing user.
 * All properties are optional except the identifier `codUsuario`.
 */
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

/**
 * Gateway controller that exposes "usuario" endpoints and
 * forwards requests to the identity-service, preserving authentication.
 */
@ApiTags('Usuarios')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('usuario')
export class UsuarioGatewayController {
  /**
   * Base URL of identity-service used by this gateway.
   */
  private readonly identityBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.identityBaseUrl =
      this.configService.get<string>(IDENTITY_URL_CONFIG_KEY) ??
      DEFAULT_IDENTITY_BASE_URL;
  }

  /**
   * Builds authorization headers from the incoming request to forward
   * the bearer token to identity-service.
   */
  private buildAuthHeaders(req: any): { Authorization: string } {
    return {
      Authorization: req.headers['authorization'] || '',
    };
  }

  /**
   * Builds the full URL to the identity-service endpoint.
   */
  private buildIdentityUrl(path: string): string {
    return `${this.identityBaseUrl}${path}`;
  }

  @Get('listar')
  @ApiOperation({ summary: 'List all users' })
  async listar(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildIdentityUrl('/usuario/listar'),
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current authenticated user data' })
  async me(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildIdentityUrl('/usuario/me'),
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get(':codUsuario')
  @ApiOperation({ summary: 'Find a user by its identifier' })
  @ApiParam({ name: 'codUsuario', type: Number })
  async buscar(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Req() req: any,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildIdentityUrl(`/usuario/${codUsuario}`),
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Post('crear')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CrearUsuarioDto })
  async crear(
    @Body() dto: CrearUsuarioDto,
    @Req() req: any,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.buildIdentityUrl('/usuario/crear'),
          dto,
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Put('modificar')
  @ApiOperation({ summary: 'Modify an existing user' })
  @ApiBody({ type: ModificarUsuarioDto })
  async modificar(
    @Body() dto: ModificarUsuarioDto,
    @Req() req: any,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.put(
          this.buildIdentityUrl('/usuario/modificar'),
          dto,
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Delete('borrar/:codUsuario')
  @ApiOperation({ summary: 'Delete a user by its identifier' })
  @ApiParam({ name: 'codUsuario', type: Number })
  async borrar(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @CurrentUser('id') currentUserId: number,
    @Req() req: any,
  ): Promise<unknown> {
    if (Number.isFinite(currentUserId) && currentUserId === codUsuario) {
      // Prevent users from deleting themselves.
      throw new HttpException(
        'No puedes eliminar tu propio usuario',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(
          this.buildIdentityUrl(`/usuario/borrar/${codUsuario}`),
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
