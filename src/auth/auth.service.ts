// src/auth/auth.service.ts
import * as argon2 from 'argon2';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository, LessThanOrEqual } from 'typeorm';
import { UsuarioService } from 'src/modules/public/usuario/usuario.service';
import { Usuario } from 'src/models/usuario/usuario';

import crypto from 'crypto';
import { TokenReinicioContrasena } from 'src/models/token-reinicio-contraseña/token-reinicio-contraseña';

@Injectable()
export class AuthService {
  private tokenRepo: Repository<TokenReinicioContrasena>;
  private readonly jwtSecret: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly usuarios: UsuarioService,
    private readonly dataSource: DataSource,
    private readonly cfg: ConfigService,
  ) {
    this.tokenRepo = this.dataSource.getRepository(TokenReinicioContrasena);
    this.jwtSecret = this.cfg.get<string>('JWT_SECRET') || 'dev_fallback_secret';
  }

  async validateUser(correo: string, password: string): Promise<Usuario> {
    const user = await this.usuarios.findByCorreo(correo);
    const generic = new UnauthorizedException('Credenciales inválidas');
    if (!user) throw generic;
    const ok = await argon2.verify(user.contrasenaUsuario, password);
    if (!ok) throw generic;
    return user;
  }

  async signTokens(userId: number, correo: string) {
    const payload = { sub: userId, email: correo };
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.jwtSecret,                  // <-- aquí
    });
    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: this.jwtSecret,                  // <-- y aquí
    });
    return { access_token, refresh_token };
  }


  async hashPassword(pw: string) {
    return argon2.hash(pw, { type: argon2.argon2id });
  }

  async rotateRefreshToken(user: Usuario, _oldRt: string) {
    const tokens = await this.signTokens(user.codUsuario, user.correoUsuario);
    const rtHash = await this.hashPassword(tokens.refresh_token);
    await this.usuarios.setRefreshTokenHash(user.codUsuario, rtHash);
    return tokens;
  }

  // ------------------------
  // Forgot / Reset password
  // ------------------------

  async requestPasswordReset(email: string): Promise<{ ok: true; token: string }> {
    const user = await this.usuarios.findByCorreo(email);
    if (!user) {
      // Para no filtrar usuarios, respondemos OK igual.
      return { ok: true, token: '' };
    }

    // Limpia tokens vencidos de este usuario (opcional)
    await this.tokenRepo.delete({ expiracionToken: LessThanOrEqual(new Date()) });

    // Crea token aleatorio (url-safe)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 60 minutos

    const t = this.tokenRepo.create({
      codUsuario: user.codUsuario,
      token,
      expiracionToken: expires,
    });
    await this.tokenRepo.save(t);

    // Aquí enviarías el email real. De momento, retornamos el token (útil en dev).
    // En prod: integra un Mailer y manda un link del tipo:
    // https://tuapp.com/reset-password?token=<token>
    return { ok: true, token };
  }

  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ ok: true }> {
    const record = await this.tokenRepo.findOne({ where: { token } });
    if (!record) throw new BadRequestException('Token inválido');
    if (record.expiracionToken <= new Date()) {
      await this.tokenRepo.delete({ codToken: record.codToken, codUsuario: record.codUsuario });
      throw new BadRequestException('Token expirado');
    }

    const passwordHash = await this.hashPassword(newPassword);
    await this.usuarios.updatePasswordHash(record.codUsuario, passwordHash);

    // Invalida sessions/refresh previos (opcional pero recomendado)
    await this.usuarios.incrementTokenVersion(record.codUsuario);

    // Elimina el token usado
    await this.tokenRepo.delete({ codToken: record.codToken, codUsuario: record.codUsuario });

    return { ok: true };
  }
}
