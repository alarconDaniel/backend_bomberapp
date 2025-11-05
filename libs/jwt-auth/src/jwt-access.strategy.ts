import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { JWT_VERIFIER_OPTIONS } from './constants';
import { JwtVerifierModuleOptions } from './interfaces/jwt-verifier-module-options.interface';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(JWT_VERIFIER_OPTIONS) private readonly options: JwtVerifierModuleOptions) {
    super({
      jwtFromRequest: options.jwtFromRequest ?? ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: options.ignoreExpiration ?? false,
      secretOrKey: options.secretOrPublicKey,
      issuer: options.issuer,
      audience: options.audience,
    } as StrategyOptions);
  }

  async validate(payload: Record<string, any>) {
    if (this.options.mapPayload) {
      return this.options.mapPayload(payload);
    }

    return payload;
  }
}
