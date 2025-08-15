// auth/auth.service.ts
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, /* inyecta UsersService/Repo */) {}

  async hashPassword(pw: string) {
    return argon2.hash(pw, { type: argon2.argon2id });
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email); // consulta DB (Prisma/TypeORM)
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    return user;
  }

  async signTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const access_token = await this.jwt.signAsync(payload, { expiresIn: '15m' });
    const refresh_token = await this.jwt.signAsync(payload, { expiresIn: '7d' });
    return { access_token, refresh_token };
  }

  async rotateRefreshToken(oldRt: string) {
    // opcional: guardar hash del RT en DB y verificarlo para rotación segura
  }
}
