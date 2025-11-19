// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsuarioModule } from 'src/modules/usuario/usuario.module';
import { ConexionModule } from 'src/config/conexion.module';

const JWT_SECRET_CONFIG_KEY = 'JWT_SECRET';
const DEFAULT_JWT_SECRET = 'dev_fallback_secret';
const JWT_ISSUER = 'bomberapp';

/**
 * Authentication module responsible for:
 * - configuring JWT signing and verification,
 * - exposing the AuthService,
 * - wiring the JWT strategy and controller.
 */
@Module({
  imports: [
    ConfigModule,
    PassportModule,
    ConexionModule,
    UsuarioModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Fallback secret is used in development when JWT_SECRET is not provided.
        secret:
          configService.get<string>(JWT_SECRET_CONFIG_KEY) ??
          DEFAULT_JWT_SECRET,
        signOptions: { issuer: JWT_ISSUER },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
