import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConexionModule } from "./config/conexion.module";
import { UsuarioModule } from "./modules/usuario/usuario.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // para no tener que importarlo en todos los módulos
    }),
    ConexionModule,
    UsuarioModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
        {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 👈 guard global
    },
    AppService],
})
export class AppModule {}
