import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthUserShape } from './decorators/current-user.decorator';

const JWT_SECRET_CONFIG_KEY = 'JWT_SECRET';

@Injectable()
/**
 * Passport JWT strategy responsible for validating incoming JWT tokens
 * and attaching the decoded payload to the request object as `req.user`.
 */
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>(JWT_SECRET_CONFIG_KEY),
    });
  }

  /**
   * Validates the decoded JWT payload.
   *
   * The payload is expected to be what identity-service signs
   * (e.g. sub, email, rol, etc.). The returned object will be
   * assigned to `req.user` for downstream handlers and decorators.
   */
  async validate(payload: AuthUserShape): Promise<AuthUserShape> {
    return payload;
  }
}
