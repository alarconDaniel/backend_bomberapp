// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { AuthGatewayController } from './auth-gateway/auth-gateway.controller';
import { UsuarioGatewayController } from './usuario/usuario.controller';
import { RetoGatewayController } from './reto/reto.controller';

import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RetoModule } from './reto/reto.module';
import { MisRetosGatewayModule } from './mis-retos/mis-retos.module';

const DEFAULT_JWT_SECRET = 'dev_fallback_secret';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? DEFAULT_JWT_SECRET,
      }),
    }),
    RetoModule,
    MisRetosGatewayModule,
  ],
  controllers: [
    AuthGatewayController,
    UsuarioGatewayController,
    RetoGatewayController,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Ensures JWT authentication is applied globally to all routes.
    },
  ],
})
export class AppModule {}
