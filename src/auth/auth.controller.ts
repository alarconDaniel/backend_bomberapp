// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsuarioService } from 'src/modules/public/usuario/usuario.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
    private readonly users: UsuarioService,
    private readonly cfg: ConfigService,
  ) { }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    const tokens = await this.auth.signTokens(user.codUsuario, user.correoUsuario);
    return { user: { id: user.codUsuario, email: user.correoUsuario, rol: user.rol.nombreRol}, ...tokens };
    // En un paso posterior puedes guardar y verificar hash del refresh como hicimos en rotateRefreshToken
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    const decoded = await this.jwt.verifyAsync(body.refresh_token, {
      secret: this.cfg.get<string>('JWT_SECRET') || 'dev_fallback_secret',
    });
    const user = await this.users.findByCorreo(decoded.email);
    if (!user) throw new UnauthorizedException();

    // 👈 Pasa el refresh recibido como segundo parámetro
    return this.auth.rotateRefreshToken(user, body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req) { return req.user; }

  // ---- Forgot / Reset ----
  @Public()
  @Post('forgot-password')
  async forgot(@Body() dto: ForgotPasswordDto) {
    // En dev devolvemos el token para que lo pruebes
    return this.auth.requestPasswordReset(dto.email);
  }

  @Public()
  @Post('reset-password')
  async reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPasswordWithToken(dto.token, dto.newPassword);
  }
}
