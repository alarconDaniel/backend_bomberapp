// src/auth/auth.service.ts
import * as argon2 from 'argon2';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { UsuarioService } from 'src/modules/usuario/usuario.service';
import { Usuario } from 'src/models/usuario/usuario';


@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly usuarios: UsuarioService,
    private readonly cfg: ConfigService,
  ) {
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

    const ACCESS_TTL = this.cfg.get<string>('JWT_ACCESS_TTL') || '15m';
    const REFRESH_TTL = this.cfg.get<string>('JWT_REFRESH_TTL') || '30d';

    const payload = { sub: userId, email: correo };
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: ACCESS_TTL as any,
      secret: this.jwtSecret,                  // <-- aquí
    });
    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: REFRESH_TTL as any,
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

  // -- LogOut -- 

  // auth.service.ts
  async invalidateRefresh(refreshToken: string) {
    // Si guardas hash del refresh por usuario:
    const payload = await this.jwt.verifyAsync(refreshToken, { secret: this.jwtSecret });
    const user = await this.usuarios.findByCorreo(payload.email);
    if (!user) return;
    // opción A: borrar hash guardado
    await this.usuarios.clearRefreshTokenHash(user.codUsuario);
    // opción B: incrementar versionado para invalidar todos los refresh previos
    await this.usuarios.incrementTokenVersion(user.codUsuario);
  }
}
