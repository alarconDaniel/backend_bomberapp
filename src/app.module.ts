import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RetoModule } from './modules/public/reto/reto.module';
import { ConexionModule } from './config/conexion/conexion.module';
import { ConfigModule } from '@nestjs/config';
import { UsuarioModule } from './modules/public/usuario/usuario.module';
import { ArchivoModule } from './modules/public/archivo/archivo.module';

@Module({
  imports: [ConexionModule, ConfigModule.forRoot({
    envFilePath: ".env",
    isGlobal: true
    
  }),RetoModule,UsuarioModule,  ArchivoModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
