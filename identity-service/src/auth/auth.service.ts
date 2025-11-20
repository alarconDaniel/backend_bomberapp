// src/auth/auth.service.ts
import * as argon2 from 'argon2';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsuarioService } from 'src/modules/usuario/usuario.service';
import { Usuario } from 'src/models/usuario/usuario';

const JWT_SECRET_CONFIG_KEY = 'JWT_SECRET';
const JWT_ACCESS_TTL_CONFIG_KEY = 'JWT_ACCESS_TTL';
const JWT_REFRESH_TTL_CONFIG_KEY = 'JWT_REFRESH_TTL';

const DEFAULT_JWT_SECRET = 'dev_fallback_secret';
const DEFAULT_ACCESS_TTL = '15m';
const DEFAULT_REFRESH_TTL = '30d';

const INVALID_CREDENTIALS_MESSAGE = 'Credenciales inválidas';

@Injectable()
/**
 * Authentication service responsible for validating users,
 * issuing tokens and managing refresh token lifecycle.
 */
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>(JWT_SECRET_CONFIG_KEY) ||
      DEFAULT_JWT_SECRET;
  }

  /**
   * Validates a user by email and password.
   * Throws UnauthorizedException when credentials are invalid.
   */
  async validateUser(correo: string, password: string): Promise<Usuario> {
    const user = await this.usuarioService.findByCorreo(correo);
    const unauthorizedError = new UnauthorizedException(
      INVALID_CREDENTIALS_MESSAGE,
    );

    if (!user) {
      throw unauthorizedError;
    }

    const isPasswordValid = await argon2.verify(
      user.contrasenaUsuario,
      password,
    );
    if (!isPasswordValid) {
      throw unauthorizedError;
    }

    return user;
  }

  /**
   * Signs and returns both access and refresh tokens for the given user.
   */
  async signTokens(
    userId: number,
    correo: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const accessTtl =
      this.configService.get<string>(JWT_ACCESS_TTL_CONFIG_KEY) ||
      DEFAULT_ACCESS_TTL;
    const refreshTtl =
      this.configService.get<string>(JWT_REFRESH_TTL_CONFIG_KEY) ||
      DEFAULT_REFRESH_TTL;

    const payload = { sub: userId, email: correo };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: accessTtl as any,
      secret: this.jwtSecret,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: refreshTtl as any,
      secret: this.jwtSecret,
    });

    return { access_token, refresh_token };
  }

  /**
   * Hashes a password or token using Argon2id.
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  /**
   * Rotates the refresh token for the given user:
   * - issues new access and refresh tokens,
   * - stores the new hashed refresh token.
   */
  async rotateRefreshToken(
    user: Usuario,
    _oldRefreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const tokens = await this.signTokens(user.codUsuario, user.correoUsuario);
    const refreshTokenHash = await this.hashPassword(tokens.refresh_token);

    await this.usuarioService.setRefreshTokenHash(
      user.codUsuario,
      refreshTokenHash,
    );

    return tokens;
  }

  /**
   * Invalidates the provided refresh token for the associated user.
   *
   * Strategy:
   * - Clear the stored refresh token hash.
   * - Increment token version to invalidate all previously issued refresh tokens.
   */
  async invalidateRefresh(refreshToken: string): Promise<void> {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.jwtSecret,
    });

    const user = await this.usuarioService.findByCorreo(payload.email);
    if (!user) {
      return;
    }

    // Option A: remove stored refresh token hash.
    await this.usuarioService.clearRefreshTokenHash(user.codUsuario);

    // Option B: increment version to invalidate all previous refresh tokens.
    await this.usuarioService.incrementTokenVersion(user.codUsuario);
  }
}
