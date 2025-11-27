// src/auth/jwt.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
// Estrategia JWT de Passport:
// - Lee el token desde el header Authorization: Bearer <token>
// - Verifica firma con la clave configurada
// - Expone el payload validado en req.user
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // Extrae el JWT del encabezado Authorization como Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Clave usada para verificar la firma del token
      // (en una versión más pulida podría venir por ConfigService)
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // Este método se ejecuta si el token es válido.
  // Lo que retornemos aquí se asigna a req.user en los handlers protegidos.
  async validate(payload: { sub: number; email: string }) {
    return payload; // va a req.user
  }
}
