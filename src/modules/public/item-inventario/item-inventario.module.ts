import { Module } from '@nestjs/common';
import { ItemInventarioController } from './item-inventario.controller';
import { ItemInventarioService } from './item-inventario.service';

@Module({
  controllers: [ItemInventarioController],
  providers: [ItemInventarioService]
})
export class ItemInventarioModule {}
