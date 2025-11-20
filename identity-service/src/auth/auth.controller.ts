// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { UsuarioService } from 'src/modules/usuario/usuario.service';
import { CurrentUser, AuthUserShape } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';

const JWT_SECRET_CONFIG_KEY = 'JWT_SECRET';
const DEFAULT_JWT_SECRET = 'dev_fallback_secret';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';
const INVALID_REFRESH_TOKEN_MESSAGE = 'Refresh inválido';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Returns the secret used to validate JWT tokens.
   * Falls back to a development secret when not configured.
   */
  private getJwtSecret(): string {
    return (
      this.configService.get<string>(JWT_SECRET_CONFIG_KEY) ??
      DEFAULT_JWT_SECRET
    );
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user and issue tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description:
      'Successful login. Returns access_token, refresh_token and basic user data.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<unknown> {
    const user = await this.authService.validateUser(dto.email, dto.password);

    const tokens = await this.authService.signTokens(
      user.codUsuario,
      user.correoUsuario,
    );

    await this.usuarioService.setRefreshTokenHash(
      user.codUsuario,
      await this.authService.hashPassword(tokens.refresh_token),
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
  @ApiOperation({ summary: 'Rotate tokens using a valid refresh_token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 201,
    description:
      'Returns a new access_token and refresh_token if the provided refresh_token is valid.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token or user not found',
  })
  async refresh(@Body() body: RefreshTokenDto): Promise<unknown> {
    const decoded = await this.jwtService.verifyAsync(body.refresh_token, {
      secret: this.getJwtSecret(),
    });

    const user = await this.usuarioService.findByCorreo(decoded.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isRefreshValid = await this.usuarioService.verifyRefreshToken(
      user.codUsuario,
      body.refresh_token,
    );

    if (!isRefreshValid) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    return this.authService.rotateRefreshToken(user, body.refresh_token);
  }

  @Get('me')
  @ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
  @ApiOperation({
    summary: 'Get basic information about the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user information returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid or missing token' })
  me(@CurrentUser() user: any): any {
    // `user` is the JWT payload (sub, email, rol, etc.) plus a normalized `id`.
    return user;
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout by invalidating the refresh_token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 201,
    description: 'Refresh token invalidated successfully',
  })
  async logout(@Body() body: RefreshTokenDto): Promise<{ ok: boolean }> {
    const decoded = await this.jwtService.verifyAsync(body.refresh_token, {
      secret: this.getJwtSecret(),
    });

    const user = await this.usuarioService.findByCorreo(decoded.email);
    if (user) {
      await this.usuarioService.clearRefreshTokenHash(user.codUsuario);
    }

    return { ok: true };
  }
}
