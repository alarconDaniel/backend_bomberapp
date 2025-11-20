// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { AuthGatewayController } from './auth-gateway/auth-gateway.controller';
import { UsuarioGatewayController } from './usuario/usuario.controller';
import { RetoController } from './modules/reto/reto.controller';

import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RetoModule } from './modules/reto/reto.module';
import { MisRetosGatewayModule } from './modules/mis-retos/mis-retos.module';
import { ArchivosGatewayModule } from './modules/archivos/archivos.module';
import { AvatarRopaGatewayModule } from './modules/avatar-ropa/avatar-ropa.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { MisStatsModule } from './modules/mis-stats/mis-stats.module';
import { ItemInventarioModule } from './modules/item_inventario/item_inventario.module';
import { ItemTiendaModule } from './modules/item-tienda/item-tienda.module';
import { MiPerfilModule } from './modules/mi-perfil/mi-perfil.module';
import { PreguntasModule } from './modules/preguntas/preguntas.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { RespuestasModule } from './modules/respuestas/respuestas.module';
import { TrofeoModule } from './modules/trofeo/trofeo.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsuarioLogroModule } from './modules/usuario-logro/usuario-logro.module';
import { MisRetosGatewayController } from './modules/mis-retos/mis-retos.controller';
import { ArchivosGatewayController } from './modules/archivos/archivos.controller';
import { AvatarRopaGatewayController } from './modules/avatar-ropa/avatar-ropa.controller';
import { CatalogosController } from './modules/catalogos/catalogos.controller';
import { MisStatsController } from './modules/mis-stats/mis-stats.controller';
import { ItemInventarioController } from './modules/item_inventario/item_inventario.controller';
import { ItemTiendaController } from './modules/item-tienda/item-tienda.controller';
import { PerfilController } from './modules/mi-perfil/mi-perfil.controller';
import { PreguntasController } from './modules/preguntas/preguntas.controller';
import { RankingController } from './modules/ranking/ranking.controller';
import { RespuestasController } from './modules/respuestas/respuestas.controller';
import { TrofeoController } from './modules/trofeo/trofeo.controller';
import { UploadsController } from './modules/uploads/uploads.controller';
import { UsuarioLogroController } from './modules/usuario-logro/usuario-logro.controller';

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
    ArchivosGatewayModule,
    AvatarRopaGatewayModule,
    CatalogosModule,
    MisStatsModule,
    ItemInventarioModule,
    ItemTiendaModule,
    MiPerfilModule,
    PreguntasModule,
    RankingModule,
    RespuestasModule,
    TrofeoModule,
    UploadsModule,
    UsuarioLogroModule,
  ],
  controllers: [
    AuthGatewayController,
    UsuarioGatewayController,
    RetoController,
    MisRetosGatewayController,
    ArchivosGatewayController,
    AvatarRopaGatewayController,
    CatalogosController,
    MisStatsController,
    ItemInventarioController,
    ItemTiendaController,
    PerfilController,
    PreguntasController,
    RankingController,
    RespuestasController,
    TrofeoController,
    UploadsController,
    UsuarioLogroController
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
