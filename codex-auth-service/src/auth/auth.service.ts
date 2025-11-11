import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtConfig, AUTH_JWT } from '../config/jwt.config';
import { Usuario } from '../entities/usuario.entity';
import { TokenReinicioContrasena } from '../entities/token-reinicio-contrasena.entity';
import {
  RemoteUsuario,
  UsersClientService,
} from '../users/users-client.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    @InjectRepository(TokenReinicioContrasena)
    private readonly resetTokens: Repository<TokenReinicioContrasena>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly usersClient: UsersClientService,
  ) {}

  async login(email: string, password: string) {
    const remoteUser = await this.usersClient.validateCredentials(email, password);
    if (!remoteUser) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { tokens } = await this.createSession(remoteUser);
    return { user: remoteUser, ...tokens };
  }

  async refresh(refreshToken: string) {
    const jwtConfig = this.getJwtConfig();
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: jwtConfig.refreshSecret,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });
    } catch (error) {
      throw new UnauthorizedException('Refresh inválido');
    }

    const usuario = await this.usuarios.findOne({ where: { id: payload.sub } });
    if (!usuario?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh expirado');
    }

    const matches = await argon2.verify(usuario.refreshTokenHash, refreshToken).catch(() => false);
    if (!matches) {
      throw new UnauthorizedException('Refresh inválido');
    }

    if (payload.tokenVersion !== usuario.tokenVersion) {
      throw new UnauthorizedException('Refresh desactualizado');
    }

    const remoteUser = await this.usersClient.findById(payload.sub);
    if (!remoteUser) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const nextVersion = usuario.tokenVersion + 1;
    const tokens = await this.issueTokens(remoteUser, nextVersion);
    await this.persistSession(remoteUser, tokens.refreshToken, nextVersion, usuario);

    return { user: remoteUser, ...tokens };
  }

  async logout(refreshToken: string) {
    const jwtConfig = this.getJwtConfig();
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: jwtConfig.refreshSecret,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });

      const usuario = await this.usuarios.findOne({ where: { id: payload.sub } });
      if (usuario) {
        usuario.refreshTokenHash = null;
        usuario.tokenVersion = (usuario.tokenVersion ?? 0) + 1;
        await this.usuarios.save(usuario);
      }
    } catch (error) {
      this.logger.debug('Refresh inválido en logout', error as Error);
    }

    return { ok: true };
  }

  async requestPasswordReset(email: string) {
    const remoteUser = await this.usersClient.findByEmail(email);
    if (!remoteUser) {
      return { ok: true };
    }

    const expiresAt = this.buildExpirationDate();
    const tokenValue = randomUUID();

    await this.resetTokens.save({
      userId: remoteUser.id,
      token: tokenValue,
      expiresAt,
    });

    return {
      ok: true,
      token: tokenValue,
      expiresAt,
    };
  }

  async resetPasswordWithToken(token: string, newPassword: string) {
    const tokenEntity = await this.resetTokens.findOne({
      where: { token },
    });

    if (!tokenEntity) {
      throw new NotFoundException('Token no encontrado');
    }

    if (tokenEntity.expiresAt.getTime() < Date.now()) {
      await this.resetTokens.delete({ id: tokenEntity.id });
      throw new BadRequestException('Token expirado');
    }

    await this.usersClient.updatePassword(tokenEntity.userId, newPassword);
    await this.resetTokens.delete({ id: tokenEntity.id });

    const usuario = await this.usuarios.findOne({ where: { id: tokenEntity.userId } });
    if (usuario) {
      usuario.refreshTokenHash = null;
      usuario.tokenVersion = (usuario.tokenVersion ?? 0) + 1;
      await this.usuarios.save(usuario);
    }

    return { ok: true };
  }

  private async createSession(user: RemoteUsuario) {
    const existing = await this.usuarios.findOne({ where: { id: user.id } });
    const nextVersion = (existing?.tokenVersion ?? 0) + 1;
    const tokens = await this.issueTokens(user, nextVersion);
    await this.persistSession(user, tokens.refreshToken, nextVersion, existing ?? undefined);
    return { tokens };
  }

  private async persistSession(
    user: RemoteUsuario,
    refreshToken: string,
    tokenVersion: number,
    existing?: Usuario,
  ) {
    const refreshTokenHash = await argon2.hash(refreshToken);
    const entity = existing
      ? this.usuarios.merge(existing, {
          email: user.email,
          refreshTokenHash,
          tokenVersion,
          lastLoginAt: new Date(),
        })
      : this.usuarios.create({
          id: user.id,
          email: user.email,
          refreshTokenHash,
          tokenVersion,
          lastLoginAt: new Date(),
        });
    await this.usuarios.save(entity);
  }

  private async issueTokens(user: RemoteUsuario, tokenVersion: number): Promise<AuthTokens> {
    const jwtConfig = this.getJwtConfig();
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessTtl,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshTtl,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.accessTtl,
      refreshExpiresIn: jwtConfig.refreshTtl,
    };
  }

  private buildExpirationDate() {
    const ttlMinutes = parseInt(
      this.config.get<string>('AUTH_PASSWORD_RESET_TTL_MINUTES', '15'),
      10,
    );
    return new Date(Date.now() + ttlMinutes * 60 * 1000);
  }

  private getJwtConfig(): JwtConfig {
    const cfg = this.config.get<JwtConfig>(AUTH_JWT);
    if (!cfg) {
      throw new Error('JwtConfig no disponible');
    }
    return cfg;
  }
}
