// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
// import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsuarioService } from 'src/modules/public/usuario/usuario.service';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

// Controlador de autenticación: login, refresh, perfil y logout
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
    private readonly users: UsuarioService,
    private readonly cfg: ConfigService,
  ) {}

  // ---------- LOGIN ----------

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description:
      'Retorna los datos básicos del usuario autenticado y los tokens de acceso/refresh.',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'usuario@dominio.com',
          rol: 'USER',
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async login(@Body() dto: LoginDto) {
    // Validamos credenciales y obtenemos el usuario
    const user = await this.auth.validateUser(dto.email, dto.password);

    // Firmamos los tokens de acceso y refresh
    const tokens = await this.auth.signTokens(
      user.codUsuario,
      user.correoUsuario,
    );

    // Guarda hash del refresh recién emitido (para invalidar sesiones antiguas)
    await this.users.setRefreshTokenHash(
      user.codUsuario,
      await this.auth.hashPassword(tokens.refresh_token),
    );

    // Devolvemos payload compacto de usuario + tokens
    return {
      user: {
        id: user.codUsuario,
        email: user.correoUsuario,
        rol: user.rol.nombreRol,
      },
      ...tokens,
    };
  }

  // ---------- REFRESH TOKEN ----------

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Rotar tokens usando un refresh token válido',
    description:
      'Verifica el refresh token, comprueba que sigue registrado y devuelve un nuevo par de tokens.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          description: 'Refresh token actualmente en posesión del cliente.',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refresh_token'],
    },
  })
  @ApiOkResponse({
    description:
      'Nuevo par de tokens (access y refresh) si el refresh enviado es válido.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Refresh inválido o usuario ya no permitido para rotar tokens.',
  })
  async refresh(@Body() body: { refresh_token: string }) {
    // Verificamos la firma y extraemos el payload del refresh
    const decoded = await this.jwt.verifyAsync(body.refresh_token, {
      secret: this.cfg.get<string>('JWT_SECRET') || 'dev_fallback_secret',
    });

    // Buscamos al usuario por correo contenido en el token
    const user = await this.users.findByCorreo(decoded.email);
    if (!user) throw new UnauthorizedException();

    // Verificamos que el refresh coincida con el hash guardado en BD
    const ok = await this.users.verifyRefreshToken(
      user.codUsuario,
      body.refresh_token,
    );
    if (!ok) throw new UnauthorizedException('Refresh inválido');

    // Si todo bien, rotamos el refresh y emitimos nuevo par de tokens
    return this.auth.rotateRefreshToken(user, body.refresh_token);
  }

  // ---------- PERFIL AUTENTICADO ----------

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Obtener el usuario autenticado',
    description:
      'Retorna el objeto de usuario asociado al JWT actual (contenido en req.user).',
  })
  @ApiBearerAuth('access-token') 
  @ApiOkResponse({
    description:
      'Información del usuario autenticado según lo que inyecte la estrategia JWT.',
    schema: {
      example: {
        sub: 1,
        email: 'usuario@dominio.com',
        rol: 'USER',
        iat: 1712333300,
        exp: 1712336900,
      },
    },
  })
  me(@Req() req) {
    // Simplemente devolvemos lo que la estrategia JWT haya puesto en req.user
    return req.user;
  }

  // // ---- Forgot / Reset ----
  // @Public()
  // @Post('forgot-password')
  // async forgot(@Body() dto: ForgotPasswordDto) {
  //   // En dev devolvemos el token para que lo pruebes
  //   return this.auth.requestPasswordReset(dto.email);
  // }

  // @Public()
  // @Post('reset-password')
  // async reset(@Body() dto: ResetPasswordDto) {
  //   return this.auth.resetPasswordWithToken(dto.token, dto.newPassword);
  // }

  // --- LogOut ---

  // auth.controller.ts
  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Elimina el hash del refresh token asociado al usuario, invalidando futuras rotaciones.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          description:
            'Refresh token actual del usuario, usado para identificar la sesión a invalidar.',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refresh_token'],
    },
  })
  @ApiOkResponse({
    description:
      'Confirma que el refresh token asociado al usuario fue invalidado.',
    schema: {
      example: { ok: true },
    },
  })
  async logout(@Body() body: { refresh_token: string }) {
    // Verificamos el refresh para obtener el correo del usuario
    const decoded = await this.jwt.verifyAsync(body.refresh_token, {
      secret: this.cfg.get<string>('JWT_SECRET') || 'dev_fallback_secret',
    });

    // Buscamos usuario y limpiamos el hash de su refresh en BD
    const user = await this.users.findByCorreo(decoded.email);
    if (user) await this.users.clearRefreshTokenHash(user.codUsuario);

    // Respuesta simple de éxito
    return { ok: true };
  }
}
