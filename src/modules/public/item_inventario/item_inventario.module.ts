import { Module } from '@nestjs/common';
import { ItemInventarioController } from './item_inventario.controller';
import { ItemInventarioService } from './item_inventario.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { ItemTiendaModule } from '../item-tienda/item-tienda.module';

/**
 * Módulo de ítems de inventario del usuario.
 * Orquesta controlador, servicio y dependencias (usuarios, tienda, DB).
 */
@Module({
  imports: [ConexionModule, UsuarioModule, ItemTiendaModule],
  controllers: [ItemInventarioController],
  providers: [ItemInventarioService],
  exports: [ItemInventarioService],
})
export class ItemInventarioModule {}
