import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ItemInventario } from 'src/models/item_inventario/item_inventario';
import { DataSource, In, Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { ItemTienda } from 'src/models/item-tienda/item-tienda';

@Injectable()
export class ItemInventarioService {
  private repo: Repository<ItemInventario>;

  constructor(private readonly poolConexion: DataSource) {
    this.repo = poolConexion.getRepository(ItemInventario);
  }

  // GET /item-inventario/listar
  public async listar(): Promise<ItemInventario[]> {
    return this.repo.find({ order: { codItemInventario: 'ASC' } });
  }

  // GET /item-inventario/:id
  public async obtenerPorId(id: number): Promise<ItemInventario> {
    const item = await this.repo.findOne({ where: { codItemInventario: id } });
    if (!item) throw new NotFoundException(`ItemInventario ${id} no existe`);
    return item;
  }

  async listarMisItems(codUsuario: number) {
    return await this.repo.find({
      where: { usuario: { codUsuario } }, // usa la relación 1:1
      relations: ['usuario', 'item'],
      order: { fechaCompra: 'DESC' },
    });
  }

  // ==========================
  // ===    ABRIR COFRE     ===
  // ==========================
  public async abrirCofre(codUsuario: number, codItemInventario: number) {
    if (!codUsuario) throw new ForbiddenException('Usuario no autenticado');

    const intento = async () => {
      const qr = this.poolConexion.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();
      try {
        const invRepo = qr.manager.getRepository(ItemInventario);
        const tiendaRepo = qr.manager.getRepository(ItemTienda);

        // 1) Trae el item inventario con lock
        const inv = await invRepo.findOne({
          where: { codItemInventario, usuario: { codUsuario } },
          relations: ['usuario', 'item'],
          lock: { mode: 'pessimistic_write' },
        });
        if (!inv) throw new NotFoundException('El ítem no existe o no es tuyo');

        const item = inv.item;
        if (!item) throw new InternalServerErrorException('Item de tienda faltante');
        if (String(item.tipoItem).toUpperCase() !== 'COFRE') {
          throw new BadRequestException('Este ítem no es un cofre');
        }
        if (inv.cantidad <= 0) {
          throw new BadRequestException('No te quedan cofres de este tipo');
        }

        // 2) Determina tamaño => cantidad de drops
        const size = this.detectChestSize(item);
        const count = size === 'pequeno' ? 1 : size === 'medio' ? 5 : 10;

        // 3) Arma el pool de loot (sin cofres)
        const pool = await tiendaRepo.find();
        const elegibles = pool.filter((p) => String(p.tipoItem).toUpperCase() !== 'COFRE');
        if (elegibles.length === 0) {
          throw new InternalServerErrorException('No hay recompensas elegibles');
        }

        // Inventario actual del user para evitar ropa duplicada
        const invUser = await invRepo.find({
          where: { usuario: { codUsuario } },
          relations: ['item'],
          lock: { mode: 'pessimistic_read' }, // lectura consistente
        });
        const yaPosee = new Set<number>(
          invUser.map(i => i.item?.codItem).filter(Boolean) as number[]
        );

        type Drop = { codItem: number; nombre: string; tipo: string; cantidad: number };

        // 4) Genera recompensas (puede producir repetidos en memoria)
        const rawRewards: Drop[] = [];
        const MAX_REINTENTOS_ROPA = 6;

        for (let k = 0; k < count; k++) {
          let drop: ItemTienda | null = null;
          let intentos = 0;

          while (intentos < MAX_REINTENTOS_ROPA) {
            const idx = randomInt(0, elegibles.length);
            const candidato = elegibles[idx];
            const isRopa = String(candidato.tipoItem).toUpperCase() === 'ROPA';
            if (isRopa && yaPosee.has(candidato.codItem)) {
              intentos++;
              continue;
            }
            drop = candidato;
            break;
          }

          // fallback a potenciadores si no se consiguió ropa no repetida
          if (!drop) {
            const soloPotenciadores = elegibles.filter(e => String(e.tipoItem).toUpperCase() === 'POTENCIADOR');
            drop = soloPotenciadores.length > 0
              ? soloPotenciadores[randomInt(0, soloPotenciadores.length)]
              : elegibles[randomInt(0, elegibles.length)];
          }

          rawRewards.push({
            codItem: drop.codItem,
            nombre: drop.nombreItem,
            tipo: String(drop.tipoItem).toUpperCase(),
            cantidad: 1,
          });

          if (String(drop.tipoItem).toUpperCase() === 'ROPA') {
            yaPosee.add(drop.codItem);
          }
        }

        // 🔴 5) FUSIÓN EN MEMORIA para evitar duplicidad en el mismo cofre
        const rewardsMap = new Map<number, Drop>();
        for (const r of rawRewards) {
          const prev = rewardsMap.get(r.codItem);
          if (prev) {
            prev.cantidad += r.cantidad;
          } else {
            // copia defensiva
            rewardsMap.set(r.codItem, { ...r });
          }
        }
        const rewards = Array.from(rewardsMap.values()); // ya sin duplicados

        // 6) Aplica cambios en BD dentro de la misma transacción
        //    - Descontar 1 cofre (ya en lock write)
        inv.cantidad = inv.cantidad - 1;
        await invRepo.save(inv);

        //    - Upsert manual por lotes: primero leer existentes de estos cods
        const cods = rewards.map(r => r.codItem);
        const existentes = await invRepo.find({
          where: {
            usuario: { codUsuario },
            item: { codItem: In(cods) },
          },
          relations: ['item', 'usuario'],
          lock: { mode: 'pessimistic_write' },
        });

        const existingByItem = new Map<number, ItemInventario>();
        for (const row of existentes) {
          existingByItem.set(row.item.codItem, row);
        }

        const toUpdate: ItemInventario[] = [];
        const toCreate: ItemInventario[] = [];

        for (const r of rewards) {
          const ya = existingByItem.get(r.codItem);
          if (ya) {
            ya.cantidad = ya.cantidad + r.cantidad;
            toUpdate.push(ya);
          } else {
            const nuevo = invRepo.create({
              usuario: { codUsuario } as any,
              item: { codItem: r.codItem } as any,
              cantidad: r.cantidad,
            });
            toCreate.push(nuevo);
          }
        }

        if (toCreate.length > 0) await invRepo.save(toCreate);
        if (toUpdate.length > 0) await invRepo.save(toUpdate);

        await qr.commitTransaction();

        // 7) Respuesta **ya fusionada**, nada de “x1, x1” repetidos
        return {
          ok: true,
          chest: {
            codItemInventario,
            size,
            remaining: inv.cantidad,
            item: { codItem: item.codItem, nombre: item.nombreItem },
          },
          rewards, // ya viene fusionado, ej. [{codItem:123, cantidad:2}, ...]
        };
      } catch (e: any) {
        try { await qr.rollbackTransaction(); } catch {}
        throw e;
      } finally {
        try { await qr.release(); } catch {}
      }
    };

    // Reintento suave si la BD grita por índice único (carrera)
    try {
      return await intento();
    } catch (e: any) {
      // MySQL duplicate key
      if (e?.errno === 1062 || e?.code === 'ER_DUP_ENTRY') {
        // Intento una vez más: leerá el existente y sumará
        return await intento();
      }
      throw e;
    }
  }

  // Determina tamaño del cofre por nombre o precio (fallback)
  private detectChestSize(item: ItemTienda): 'pequeno' | 'medio' | 'grande' {
    const nombre = (item.nombreItem || '').toLowerCase();
    if (nombre.includes('peque')) return 'pequeno';
    if (nombre.includes('medio')) return 'medio';
    if (nombre.includes('gran')) return 'grande';

    const precio = Number(item.precioItem || 0);
    if (precio <= 10) return 'pequeno';
    if (precio <= 200) return 'medio';
    return 'grande';
  }

  //   // GET /item-inventario/usuario/:cod_usuario
  //   public async listarPorUsuario(codUsuario: number): Promise<ItemInventario[]> {
  //     return this.repo.find({
  //       where: { codUsuario: codUsuario },
  //       order: { fechaCompra: 'DESC' },
  //     });
  //   }

  // // POST /item-inventario/crear
  // public async crear(body: any): Promise<ItemInventario> {
  //   try {
  //     const entity = this.repo.create({
  //       cod_usuario: body.cod_usuario,
  //       cod_item: body.cod_item,
  //       cantidad_item: body.cantidad_item,
  //       ...(body.fecha_compra_item && { fecha_compra_item: body.fecha_compra_item }),
  //     });

  //     // 1) insert robusto (evita ambigüedades de save)
  //     const res = await this.repo.insert(entity);

  //     // 2) obtén el ID (TypeORM + MySQL: identifiers[0] y/o raw.insertId)
  //     const id =
  //       (res.identifiers?.[0]?.cod_item_inventario as number | undefined) ??
  //       (res.raw?.insertId as number | undefined);

  //     if (!id) {
  //       throw new InternalServerErrorException(
  //         'No se pudo obtener el ID del item recién creado',
  //       );
  //     }

  //     // 3) devuelve el registro tal como quedó en BD
  //     return this.obtenerPorId(id);
  //   } catch (e: any) {
  //     this.handleDbError(e, 'crear');
  //   }
  // }


  //   // PUT /item-inventario/:id
  //   public async actualizar(id: number, body: any): Promise<ItemInventario> {
  //     const existing = await this.obtenerPorId(id);
  //     try {
  //       const merged = this.repo.merge(existing, {
  //         ...(body.cantidad !== undefined && { cantidad: body.cantidad }),
  //         ...(body.fechaCompra !== undefined && { fechaCompra: body.fechaCompra }),
  //       });
  //       await this.repo.save(merged);
  //       return this.obtenerPorId(id);
  //     } catch (e: any) {
  //       this.handleDbError(e, 'actualizar');
  //     }
  //   }

  //   // DELETE /item-inventario/:id
  //   public async eliminar(id: number): Promise<void> {
  //     const result = await this.repo.delete(id);
  //     if (!result.affected) throw new NotFoundException(`ItemInventario ${id} no existe`);
  //   }

  //   // --- Helpers ---
  //   private handleDbError(e: any, action: string): never {
  //     if (e?.errno === 1452) {
  //       throw new BadRequestException(`No se pudo ${action}: referencia inválida (FK cod_usuario/cod_item).`);
  //     }
  //     if (e?.errno === 1366) {
  //       throw new BadRequestException(`No se pudo ${action}: valor/tipo inválido.`);
  //     }
  //     throw new BadRequestException(`No se pudo ${action}: ${e?.message || 'Error de base de datos'}`);
  //   }
}