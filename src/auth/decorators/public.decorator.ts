// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

// Clave de metadata que usaremos para marcar rutas como públicas
export const IS_PUBLIC_KEY = 'isPublic';

// Decorador @Public()
// Marca un handler/controlador para saltarse la autenticación (ej: en un guard global)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
