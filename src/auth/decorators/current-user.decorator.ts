// src/auth/decorators/current-user.decorator.ts
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

type CurrentUserMode = 'id' | 'raw' | undefined;

export interface AuthUserShape {
  sub?: number;
  id?: number;
  codUsuario?: number;
  cod_usuario?: number;
  email?: string;
  rol?: string;
  // agrega otros campos si tu JwtStrategy los expone
}

export const CurrentUser = createParamDecorator<CurrentUserMode>(
  (data: CurrentUserMode, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const u = (req.user || {}) as AuthUserShape;

    // Normalizamos el id sin importar cómo venga
    const id = Number(u.sub ?? u.id ?? u.codUsuario ?? u.cod_usuario);

    if (data === 'id') {
      if (!id) throw new BadRequestException('Usuario no autenticado');
      return id;
    }

    // Modo por defecto: objeto "raw" enriquecido con id normalizado
    return { ...u, id };
  }
);
