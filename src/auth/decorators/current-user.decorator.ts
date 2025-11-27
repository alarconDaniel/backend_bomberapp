// src/auth/decorators/current-user.decorator.ts
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

type CurrentUserMode = 'id' | 'raw' | undefined;

// Shape base del usuario autenticado que esperamos en req.user
export interface AuthUserShape {
  sub?: number;
  id?: number;
  codUsuario?: number;
  cod_usuario?: number;
  email?: string;
  rol?: string;
}

// Decorador @CurrentUser()
// Permite inyectar el usuario actual o solo su id normalizado en los handlers
export const CurrentUser = createParamDecorator<CurrentUserMode>(
  (data: CurrentUserMode, ctx: ExecutionContext) => {
    // Obtenemos la request HTTP del contexto de ejecución
    const req = ctx.switchToHttp().getRequest();
    const u = (req.user || {}) as AuthUserShape;

    // Normalizamos el id sin importar cómo venga (sub, id, codUsuario, cod_usuario)
    const id = Number(u.sub ?? u.id ?? u.codUsuario ?? u.cod_usuario);

    // Modo "id": solo devolvemos el identificador numérico del usuario
    if (data === 'id') {
      if (!id) throw new BadRequestException('Usuario no autenticado');
      return id;
    }

    // Modo por defecto: devolvemos el objeto "raw" enriquecido con el id normalizado
    return { ...u, id };
  }
);
