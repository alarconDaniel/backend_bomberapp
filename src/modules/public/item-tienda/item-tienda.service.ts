import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';
import { ItemTienda } from 'src/models/item-tienda/item-tienda';
import { ItemInventario } from 'src/models/item_inventario/item_inventario';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ItemTiendaService {

    private itemTiendaRepository: Repository<ItemTienda>

    constructor(private poolConexion: DataSource){
        this.itemTiendaRepository = poolConexion.getRepository(ItemTienda);
    }

    public async listarObjetos(): Promise<any>{
        return await this.itemTiendaRepository.find();
    }

    public async comprarItem(codUsuario: number, codItem: number, cantidad: number) {
    if (!codUsuario) throw new BadRequestException('Usuario no autenticado');
    if (!Number.isInteger(codItem) || codItem <= 0) throw new BadRequestException('codItem inválido');
    if (!Number.isInteger(cantidad) || cantidad <= 0) throw new BadRequestException('cantidad inválida');

    const qr = this.poolConexion.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const itemRepo = qr.manager.getRepository(ItemTienda);
      const statsRepo = qr.manager.getRepository(EstadisticaUsuario);
      const invRepo = qr.manager.getRepository(ItemInventario);

      const item = await itemRepo.findOne({ where: { codItem } });
      if (!item) throw new NotFoundException('Item no encontrado');

      const precio = Number(item.precioItem || 0);
      const costo = precio * cantidad;

      const stats = await statsRepo.findOne({ where: { usuario: {codUsuario} } });
      if (!stats) throw new NotFoundException('Stats del usuario no encontradas');

      if (stats.monedas < costo) {
        throw new BadRequestException('Monedas insuficientes');
      }

      // Descuenta monedas
      stats.monedas = stats.monedas - costo;
      await statsRepo.save(stats);

      // Upsert inventario (sumar si ya existe)
      let inv = await invRepo.findOne({ where: { usuario: {codUsuario}, item: {codItem} } });
      if (inv) {
        inv.cantidad = inv.cantidad + cantidad;
      } else {
        inv = invRepo.create({
          usuario: {codUsuario},
          item: {codItem},
          cantidad,
        });
      }
      await invRepo.save(inv);

      await qr.commitTransaction();

      return {
        ok: true,
        data: {
          inventario: inv,
          stats: { monedas: stats.monedas, racha: stats.racha, xp: stats.xp },
          item: { codItem: item.codItem, nombreItem: item.nombreItem, precioItem: item.precioItem },
          cantidadComprada: cantidad,
          costo,
        },
      };
    } catch (e) {
      await qr.rollbackTransaction();
      // Re-lanza para que Nest mande status correcto
      throw e;
    } finally {
      await qr.release();
    }
  }
}