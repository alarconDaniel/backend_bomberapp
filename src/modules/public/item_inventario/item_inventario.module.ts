import { Module } from '@nestjs/common';
import { ItemInventarioController } from './item_inventario.controller';
import { ItemInventarioService } from './item_inventario.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  controllers: [ItemInventarioController],
  providers: [ItemInventarioService]
})
export class ItemInventarioModule { }
