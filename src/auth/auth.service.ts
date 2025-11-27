// src/auth/auth.service.ts
import * as argon2 from 'argon2';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
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
    // Repositorio para gestionar tokens de reinicio de contraseña
    this.tokenRepo = this.dataSource.getRepository(TokenReinicioContrasena);

    // Clave usada para firmar/verificar JWT (cargada desde configuración)
    this.jwtSecret =
      this.cfg.get<string>('JWT_SECRET') || 'dev_fallback_secret';
  }

  /* ============================
     VALIDACIÓN DE CREDENCIALES
     ============================ */

  // Valida las credenciales de un usuario por correo y contraseña
  async validateUser(correo: string, password: string): Promise<Usuario> {
    const user = await this.usuarios.findByCorreo(correo);
    const generic = new UnauthorizedException('Credenciales inválidas');

    // No exponemos si falló el correo o la contraseña
    if (!user) throw generic;

    // Comparamos la contraseña enviada con el hash guardado usando argon2
    const ok = await argon2.verify(user.contrasenaUsuario, password);
    if (!ok) throw generic;

    return user;
  }

  /* ============================
     EMISIÓN DE TOKENS (ACCESS / REFRESH)
     ============================ */

  // Firma y devuelve par de tokens (access + refresh) para un usuario
  async signTokens(userId: number, correo: string) {
    // TTL configurables vía variables de entorno
    const ACCESS_TTL = this.cfg.get<string>('JWT_ACCESS_TTL') || '15m';
    const REFRESH_TTL = this.cfg.get<string>('JWT_REFRESH_TTL') || '7d';

    // Payload base compartido entre access y refresh
    const payload = { sub: userId, email: correo };

    // Token de acceso (vida corta)
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: ACCESS_TTL,
      secret: this.jwtSecret,
    });

    // Token de refresh (vida más larga)
    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: REFRESH_TTL,
      secret: this.jwtSecret,
    });

    return { access_token, refresh_token };
  }

  /* ============================
     UTILIDADES DE HASH
     ============================ */

  // Genera un hash seguro para contraseñas / refresh tokens
  async hashPassword(pw: string) {
    return argon2.hash(pw, { type: argon2.argon2id });
  }

  /* ============================
     ROTACIÓN DE REFRESH TOKEN
     ============================ */

  // Rotación de refresh token:
  // - Emite nuevo par de tokens
  // - Guarda nuevo hash de refresh en BD (invalidando el anterior)
  async rotateRefreshToken(user: Usuario, _oldRt: string) {
    const tokens = await this.signTokens(user.codUsuario, user.correoUsuario);
    const rtHash = await this.hashPassword(tokens.refresh_token);
    await this.usuarios.setRefreshTokenHash(user.codUsuario, rtHash);
    return tokens;
  }

  // ------------------------
  // Forgot / Reset password
  // ------------------------

  /* ============================
     SOLICITUD DE REINICIO DE CONTRASEÑA
     ============================ */

  // Crea y almacena un token de reinicio de contraseña para el usuario
  async requestPasswordReset(
    email: string,
  ): Promise<{ ok: true; token: string }> {
    const user = await this.usuarios.findByCorreo(email);

    // Para no filtrar si un correo existe o no, siempre respondemos ok
    if (!user) {
      return { ok: true, token: '' };
    }

    // Limpia tokens vencidos (cualquier usuario, opcional pero sanea la tabla)
    await this.tokenRepo.delete({
      expiracionToken: LessThanOrEqual(new Date()),
    });

    // Token aleatorio url-safe
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 60 minutos

    const t = this.tokenRepo.create({
      codUsuario: user.codUsuario,
      token,
      expiracionToken: expires,
    });

    await this.tokenRepo.save(t);

    // En entorno real se debería enviar un correo con el enlace de reinicio
    // Ej: https://tuapp.com/reset-password?token=<token>
    // En dev se retorna el token directamente para facilitar pruebas
    return { ok: true, token };
  }

  /* ============================
     REINICIO DE CONTRASEÑA CON TOKEN
     ============================ */

  // Cambia la contraseña del usuario validando el token de reinicio
  async resetPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<{ ok: true }> {
    // Buscamos el registro del token
    const record = await this.tokenRepo.findOne({ where: { token } });
    if (!record) throw new BadRequestException('Token inválido');

    // Si el token expiró, lo borramos y notificamos la expiración
    if (record.expiracionToken <= new Date()) {
      await this.tokenRepo.delete({
        codToken: record.codToken,
        codUsuario: record.codUsuario,
      });
      throw new BadRequestException('Token expirado');
    }

    // Actualizamos la contraseña del usuario con el nuevo hash
    const passwordHash = await this.hashPassword(newPassword);
    await this.usuarios.updatePasswordHash(record.codUsuario, passwordHash);

    // Invalida sessions/refresh previos incrementando versión de token
    await this.usuarios.incrementTokenVersion(record.codUsuario);

    // Elimina el token de reinicio ya utilizado
    await this.tokenRepo.delete({
      codToken: record.codToken,
      codUsuario: record.codUsuario,
    });

    return { ok: true };
  }

  // -- LogOut / Invalidación de refresh --

  // Invalida el refresh token de un usuario:
  // - Limpia el hash de refresh en BD
  // - Incrementa la versión de token para invalidar refresh antiguos
  async invalidateRefresh(refreshToken: string) {
    // Verificamos el refresh y extraemos su payload
    const payload = await this.jwt.verifyAsync(refreshToken, {
      secret: this.jwtSecret,
    });

    // Ubicamos al usuario asociado al refresh
    const user = await this.usuarios.findByCorreo(payload.email);
    if (!user) return;

    // Opción A: borrar hash guardado del refresh actual
    await this.usuarios.clearRefreshTokenHash(user.codUsuario);

    // Opción B: incrementar versión para invalidar todos los refresh previos
    await this.usuarios.incrementTokenVersion(user.codUsuario);
  }
}
