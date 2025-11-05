import { ModuleMetadata } from '@nestjs/common';
import { JwtFromRequestFunction } from 'passport-jwt';

export interface JwtVerifierModuleOptions {
  /**
   * Clave secreta o llave pública para validar el token.
   */
  secretOrPublicKey: string | Buffer;
  /**
   * Identificador esperado del emisor.
   */
  issuer?: string;
  /**
   * Audiencia esperada.
   */
  audience?: string;
  /**
   * Indica si se debe ignorar la expiración.
   */
  ignoreExpiration?: boolean;
  /**
   * Función personalizada para extraer el token.
   */
  jwtFromRequest?: JwtFromRequestFunction;
  /**
   * Permite transformar el payload antes de asignarlo al request.user.
   */
  mapPayload?: (payload: Record<string, any>) => Promise<any> | any;
}

export interface JwtVerifierModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<JwtVerifierModuleOptions> | JwtVerifierModuleOptions;
  inject?: any[];
}
