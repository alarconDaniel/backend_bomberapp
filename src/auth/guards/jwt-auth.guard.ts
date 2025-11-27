// src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    // Inicializamos el guard base de Passport
    super();
  }

  // Decide si la petición puede pasar o no según:
  // - Si la ruta está marcada como pública (@Public) → deja pasar
  // - Si no, delega la validación al guard JWT de Passport
  canActivate(ctx: ExecutionContext) {
    // Revisamos metadata en el handler y en la clase para ver si es "public"
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // Las rutas públicas se saltan la verificación de JWT
    if (isPublic) return true;

    // Resto de rutas: aplica la estrategia 'jwt' configurada en Passport
    return super.canActivate(ctx);
  }
}
