// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RetoModule } from './modules/public/reto/reto.module';
import { ConexionModule } from './config/conexion/conexion.module';
import { ConfigModule } from '@nestjs/config';
import { ItemTiendaModule } from './modules/public/item-tienda/item-tienda.module';
import { UsuarioModule } from './modules/public/usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UsuarioRetoModule } from './modules/public/usuario-reto/usuario-reto.module';
import { EstadisticaUsuarioModule } from './modules/public/estadistica-usuario/estadistica-usuario.module';
import { ItemInventarioModule } from './modules/public/item_inventario/item_inventario.module';
import { LogroModule } from './modules/public/logro/logro.module';
import { UsuarioLogroModule } from './modules/public/usuario-logro/usuario-logro.module';

import { PerfilModule } from './modules/public/perfil/perfil.module';
import { TrofeoModule } from './modules/public/trofeo/trofeo.module';
import { RankingModule } from './modules/public/ranking/ranking.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ArchivoModule } from './modules/public/archivo/archivo.module';
import { UploadsModule } from './modules/public/uploads/uploads.module';
import { PreguntasModule } from './modules/public/pregunta/preguntas.module';
import { RespuestasModule } from './modules/public/respuesta/respuestas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ConexionModule,
    AuthModule,
    RetoModule,
    ItemTiendaModule,
    UsuarioModule,
    UsuarioRetoModule,
    EstadisticaUsuarioModule,
    ItemInventarioModule,
    LogroModule,
    UsuarioLogroModule,
    PerfilModule,
    TrofeoModule,
    RankingModule,
    ArchivoModule,
    UploadsModule,
    PreguntasModule,
    RespuestasModule,
    ScheduleModule.forRoot(), // 👈 habilita cron jobs
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // <-- TODAS las rutas protegidas salvo @Public()
  ],
})
export class AppModule { }
