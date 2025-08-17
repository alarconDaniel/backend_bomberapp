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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // <-- TODAS las rutas protegidas salvo @Public()
  ],
})
export class AppModule {}
