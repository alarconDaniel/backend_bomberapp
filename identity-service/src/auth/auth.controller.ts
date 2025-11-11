// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from 'src/modules/usuario/usuario.service';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from './decorators/current-user.decorator';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
    private readonly users: UsuarioService,
    private readonly cfg: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description:
      'Login correcto. Devuelve access_token, refresh_token y datos básicos del usuario',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    const tokens = await this.auth.signTokens(
      user.codUsuario,
      user.correoUsuario,
    );
    await this.users.setRefreshTokenHash(
      user.codUsuario,
      await this.auth.hashPassword(tokens.refresh_token),
    );
    return {
      user: {
        id: user.codUsuario,
        email: user.correoUsuario,
        rol: user.rol.nombreRol,
      },
      ...tokens,
    };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotar tokens usando un refresh_token válido' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 201,
    description:
      'Devuelve nuevo access_token y refresh_token si el refresh es válido',
  })
  @ApiResponse({ status: 401, description: 'Refresh inválido o usuario no encontrado' })
  async refresh(@Body() body: RefreshTokenDto) {
    const decoded = await this.jwt.verifyAsync(body.refresh_token, {
      secret: this.cfg.get<string>('JWT_SECRET') || 'dev_fallback_secret',
    });
    const user = await this.users.findByCorreo(decoded.email);
    if (!user) throw new UnauthorizedException();

    const ok = await this.users.verifyRefreshToken(
      user.codUsuario,
      body.refresh_token,
    );
    if (!ok) throw new UnauthorizedException('Refresh inválido');

    return this.auth.rotateRefreshToken(user, body.refresh_token);
  }

  @Get('me')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Obtener información básica del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Usuario autenticado encontrado' })
  @ApiResponse({ status: 401, description: 'Token inválido o ausente' })
  me(@CurrentUser() user: any) {
    // user = payload del JWT (sub, email, etc) + id normalizado
    return user;
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión (invalidar refresh_token)' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 201, description: 'Refresh invalidado correctamente' })
  async logout(@Body() body: RefreshTokenDto) {
    const decoded = await this.jwt.verifyAsync(body.refresh_token, {
      secret: this.cfg.get<string>('JWT_SECRET') || 'dev_fallback_secret',
    });
    const user = await this.users.findByCorreo(decoded.email);
    if (user) await this.users.clearRefreshTokenHash(user.codUsuario);
    return { ok: true };
  }
}
