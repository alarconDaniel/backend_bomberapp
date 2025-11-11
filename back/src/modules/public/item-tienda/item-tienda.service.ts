import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ItemTienda } from 'src/models/item-tienda/item-tienda';
import { ItemInventario } from 'src/models/item_inventario/item_inventario';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';

@Injectable()
export class ItemTiendaService {
  private itemTiendaRepository: Repository<ItemTienda>;

  constructor(private poolConexion: DataSource) {
    this.itemTiendaRepository = poolConexion.getRepository(ItemTienda);
  }

  /**
   * Fecha del día en zona horaria de Bogotá (America/Bogota), formato YYYY-MM-DD.
   * Esto asegura que la rotación cambie a las 00:00 hora local de Colombia.
   */
  private hoyBogotaString(): string {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = fmt.formatToParts(new Date());
    const y = parts.find(p => p.type === 'year')?.value ?? '1970';
    const m = parts.find(p => p.type === 'month')?.value ?? '01';
    const d = parts.find(p => p.type === 'day')?.value ?? '01';
    return `${y}-${m}-${d}`;
  }

  /** Hash sencillo a partir de un string (para semilla determinística) */
  private simpleHash(str: string): number {
    let h = 2166136261 >>> 0; // FNV offset basis (32-bit)
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /** PRNG lineal congruente determinístico (32-bit) */
  private lcg(seed: number) {
    let s = seed >>> 0;
    return () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0; // parámetros clásicos LCG
      return s;
    };
  }

  /** Baraja determinística con PRNG provisto */
  private shuffleSeeded<T>(arr: T[], seed: number): T[] {
    const prng = this.lcg(seed);
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const r = prng() / 0xffffffff; // [0,1)
      const j = Math.floor(r * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Selecciona N prendas de ropa de forma determinística por día (sin tocar BD) */
  private seleccionarRopaDelDia(ropa: ItemTienda[], n = 3): ItemTienda[] {
    if (ropa.length <= n) return ropa; // si hay <=3, muestra todas
    const seed = this.simpleHash(this.hoyBogotaString());
    const barajadas = this.shuffleSeeded(ropa, seed);
    return barajadas.slice(0, n);
  }

  /**
   * Devuelve la lista de items de tienda visible para el usuario:
   * - Para ROPA: solo las 3 del día (según medianoche America/Bogota)
   * - Para todo: añade flag yaPosee según inventario del usuario
   */
  public async listarObjetos(codUsuario: number): Promise<any> {
    const repoInv = this.poolConexion.getRepository(ItemInventario);

    const [todos, invUsuario] = await Promise.all([
      this.itemTiendaRepository.find(),
      repoInv.find({
        where: { usuario: { codUsuario } },
        relations: ['item'],
      }),
    ]);

    const setPoseidos = new Set<number>(
      invUsuario.map((ii) => ii.item?.codItem).filter(Boolean) as number[],
    );

    const ropa = todos.filter((t) => String(t.tipoItem).toUpperCase() === 'ROPA');
    const otros = todos.filter((t) => String(t.tipoItem).toUpperCase() !== 'ROPA');

    const ropaDelDia = this.seleccionarRopaDelDia(ropa, 3);

    const visibles = [...otros, ...ropaDelDia]
      .sort((a, b) => a.codItem - b.codItem)
      .map((it) => ({
        codItem: it.codItem,
        nombreItem: it.nombreItem,
        desripcionItem: it.desripcionItem,
        precioItem: it.precioItem,
        tipoItem: it.tipoItem,
        // Si tu tabla tiene columna JSON 'metadata_item', pásala:
        // metadataItem: (it as any).metadataItem ?? null,
        yaPosee: setPoseidos.has(it.codItem),
        iconoPath: it.iconoItem,
      }));

    return {
      hoy: this.hoyBogotaString(),
      total: visibles.length,
      items: visibles,
    };
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

      const isRopa = String(item.tipoItem).toUpperCase() === 'ROPA';

      // Reglas para ROPA: única, cantidad fija 1 y no duplicada
      if (isRopa) {
        if (cantidad !== 1) {
          throw new BadRequestException('La ropa es única: solo puedes comprar 1 unidad.');
        }
        const yaTiene = await invRepo.findOne({ where: { usuario: { codUsuario }, item: { codItem } } });
        if (yaTiene) {
          throw new BadRequestException('Ya tienes este artículo');
        }
      }

      const precio = Number(item.precioItem || 0);
      const costo = precio * (isRopa ? 1 : cantidad);

      const stats = await statsRepo.findOne({ where: { usuario: { codUsuario } } });
      if (!stats) throw new NotFoundException('Stats del usuario no encontradas');

      if (stats.monedas < costo) {
        throw new BadRequestException('Monedas insuficientes');
      }

      // Descuenta monedas
      stats.monedas = stats.monedas - costo;
      await statsRepo.save(stats);

      // Upsert inventario (sumar si ya existe). Para ROPA no debería existir (ya validado arriba)
      let inv = await invRepo.findOne({ where: { usuario: { codUsuario }, item: { codItem } } });
      if (inv) {
        inv.cantidad = inv.cantidad + (isRopa ? 0 : cantidad);
      } else {
        inv = invRepo.create({
          usuario: { codUsuario } as any,
          item: { codItem } as any,
          cantidad: isRopa ? 1 : cantidad,
        });
      }
      await invRepo.save(inv);

      await qr.commitTransaction();

      return {
        ok: true,
        data: {
          inventario: inv,
          stats: { monedas: stats.monedas, racha: stats.racha, xp: stats.xp },
          item: { codItem: item.codItem, nombreItem: item.nombreItem, precioItem: item.precioItem, tipoItem: item.tipoItem },
          cantidadComprada: isRopa ? 1 : cantidad,
          costo,
        },
      };
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
}
