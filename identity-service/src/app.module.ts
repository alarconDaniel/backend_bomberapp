import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConexionModule } from './config/conexion.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

/**
 * Root application module.
 * Wires global configuration, database connection, core feature modules
 * and the global authentication guard.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes configuration available across the app without re-importing the module.
    }),
    ConexionModule,
    UsuarioModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Registers JwtAuthGuard as a global guard for all routes.
    },
    AppService,
  ],
})
export class AppModule {}
