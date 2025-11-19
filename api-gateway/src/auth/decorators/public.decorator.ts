import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route handler as publicly accessible (no authentication required).
 *
 * Usage:
 * ```ts
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
