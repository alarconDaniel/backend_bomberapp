// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthUserShape } from './decorators/current-user.decorator';

const JWT_SECRET_CONFIG_KEY = 'JWT_SECRET';
const DEFAULT_JWT_SECRET = 'dev_fallback_secret';

@Injectable()
/**
 * Passport JWT strategy responsible for:
 * - extracting the JWT from the Authorization header,
 * - validating the token signature,
 * - attaching the decoded payload to `req.user`.
 */
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<string>(JWT_SECRET_CONFIG_KEY) ??
        DEFAULT_JWT_SECRET,
    });
  }

  /**
   * Validates the decoded JWT payload.
   *
   * Whatever is returned here will be assigned to `req.user`
   * and can be accessed by downstream guards and decorators.
   */
  async validate(payload: AuthUserShape): Promise<AuthUserShape> {
    return payload;
  }
}
