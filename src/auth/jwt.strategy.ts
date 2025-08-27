// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

type JwtPayload = { sub: number; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly ds: DataSource,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET') ?? process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    // Intenta leer el rol desde tu tabla de usuarios.
    // Ajusta el nombre exacto de tabla/columnas si es necesario.
    let row: any | undefined;

    try {
      // Caso común: tabla 'usuarios'
      const res = await this.ds.query(
        'SELECT cod_rol AS codRol FROM usuarios WHERE cod_usuario = ? LIMIT 1',
        [payload.sub],
      );
      row = res?.[0];
    } catch (_) {
      // Fallback por si la tabla se llama 'usuario'
      try {
        const res2 = await this.ds.query(
          'SELECT cod_rol AS codRol FROM usuario WHERE cod_usuario = ? LIMIT 1',
          [payload.sub],
        );
        row = res2?.[0];
      } catch {
        // deja row undefined, y más abajo tratamos como no-admin
      }
    }

    const codRol: number | null = row?.codRol ?? null;
    const rol = codRol === 1 ? 'admin' : 'operario';

    // Lo que retornes aquí queda en req.user
    return { id: payload.sub, email: payload.email, codRol, rol };
  }
}
