// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

type JwtPayload = { sub?: number; email?: string; [k: string]: any };

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
    // Normaliza el 'sub' por si tu token usa otra clave (codUsuario, userId, etc.)
    const sub =
      Number(payload?.sub ?? payload?.codUsuario ?? payload?.userId ?? NaN);

    if (!Number.isFinite(sub) || sub <= 0) {
      throw new UnauthorizedException('JWT inválido: sub ausente o no válido');
    }

    const email = payload?.email ?? null;

    // Intenta leer el rol desde la base de datos (ajusta nombres si tu esquema difiere)
    let codRol: number | null = null;
    try {
      // Caso común: tabla 'usuarios'
      const res = await this.ds.query(
        'SELECT cod_rol AS codRol FROM usuarios WHERE cod_usuario = ? LIMIT 1',
        [sub],
      );
      codRol = res?.[0]?.codRol ?? null;

      // Fallback si la tabla es 'usuario'
      if (codRol === null) {
        const res2 = await this.ds.query(
          'SELECT cod_rol AS codRol FROM usuario WHERE cod_usuario = ? LIMIT 1',
          [sub],
        );
        codRol = res2?.[0]?.codRol ?? null;
      }
    } catch {
      // Si falla la consulta, deja codRol en null y continuamos
      codRol = null;
    }

    const rol = codRol === 1 ? 'admin' : 'operario';

    // ⚠️ Importante: devolver 'sub' para que los controllers lo lean como req.user.sub
    return {
      sub,           // ← tus controllers usan esto
      email,
      codRol,
      rol,
    };
  }
}
