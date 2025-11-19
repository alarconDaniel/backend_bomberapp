// src/auth/decorators/current-user.decorator.ts
import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

type CurrentUserMode = 'id' | 'raw' | undefined;

export interface AuthUserShape {
  sub?: number;      // Subject claim as set in the JWT.
  id?: number;       // Normalized id if another service chooses to expose it this way.
  email?: string;
  rol?: string;      // User role as encoded in the JWT payload.
}

const UNAUTHENTICATED_USER_MESSAGE = 'Usuario no autenticado';

/**
 * Extracts the user object from the HTTP request attached to the context.
 */
function getRequestUser(context: ExecutionContext): AuthUserShape {
  const request = context.switchToHttp().getRequest();
  return (request.user ?? {}) as AuthUserShape;
}

/**
 * Normalizes the user id by preferring the `sub` claim and falling back to `id`.
 * The return value mirrors the original behavior and may be NaN or any falsy value.
 */
function normalizeUserId(user: AuthUserShape): number {
  return Number(user.sub ?? user.id);
}

/**
 * Parameter decorator that injects the authenticated user into controller handlers.
 *
 * Usage:
 * - @CurrentUser('id')   -> returns the normalized numeric user id.
 * - @CurrentUser('raw')  -> returns the full user payload with a normalized `id` field.
 * - @CurrentUser()       -> behaves like 'raw' mode.
 */
export const CurrentUser = createParamDecorator<CurrentUserMode>(
  (mode: CurrentUserMode, context: ExecutionContext) => {
    const user = getRequestUser(context);
    const normalizedUserId = normalizeUserId(user);

    if (mode === 'id') {
      if (!normalizedUserId || Number.isNaN(normalizedUserId)) {
        throw new BadRequestException(UNAUTHENTICATED_USER_MESSAGE);
      }
      return normalizedUserId;
    }

    // Default mode: return the raw user object enriched with the normalized id.
    return {
      ...user,
      id: normalizedUserId,
    };
  },
);
