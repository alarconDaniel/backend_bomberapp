// src/auth/decorators/current-user.decorator.ts
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

type CurrentUserMode = 'id' | 'raw' | undefined;

export interface AuthUserShape {
  sub?: number;      // lo que tú pones en el JWT
  id?: number;       // por si algún día otro servicio lo normaliza así
  email?: string;
  rol?: string;
}

export const CurrentUser = createParamDecorator<CurrentUserMode>(
  (data: CurrentUserMode, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const u = (req.user || {}) as AuthUserShape;

    // Normalizamos el id: preferimos sub, si no, id
    const id = Number(u.sub ?? u.id);

    if (data === 'id') {
      if (!id || Number.isNaN(id)) {
        throw new BadRequestException('Usuario no autenticado');
      }
      return id;
    }

    // Modo por defecto: objeto "raw" enriquecido con id normalizado
    return { ...u, id };
  },
);
