import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
/**
 * JWT authentication guard that allows public routes to bypass authentication
 * when decorated with `@Public()`.
 */
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Returns true when the current route handler or controller is marked as public.
   */
  private isPublicRoute(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return isPublic === true;
  }
}
