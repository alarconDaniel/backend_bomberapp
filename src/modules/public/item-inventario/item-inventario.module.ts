import { Module } from '@nestjs/common';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { ItemInventarioController } from './item-inventario.controller';
import { ItemInventarioService } from './item-inventario.service';

@Module({
  imports: [ConexionModule],
  controllers: [ItemInventarioController],
  providers: [ItemInventarioService],
  exports: [ItemInventarioService],
})
export class ItemInventarioModule {}
