import { Module } from '@nestjs/common';
import { ItemTiendaController } from './item-tienda.controller';
import { ItemTiendaService } from './item-tienda.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  controllers: [ItemTiendaController],
  providers: [ItemTiendaService],
  
})
export class ItemTiendaModule {}
