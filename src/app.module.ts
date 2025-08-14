import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RetoModule } from './modules/public/reto/reto.module';
import { ConexionModule } from './config/conexion/conexion.module';
import { ConfigModule } from '@nestjs/config';
import { ItemTienda } from './models/item-tienda/item-tienda';
import { ItemTiendaModule } from './modules/public/item-tienda/item-tienda.module';

@Module({
  imports: [ConexionModule, ConfigModule.forRoot({
    envFilePath: ".env",
    isGlobal: true
  }),RetoModule, ItemTiendaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
