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
  // ===  NUEVO: ABRIR COFRE ==
  // ==========================
  public async abrirCofre(codUsuario: number, codItemInventario: number) {
    if (!codUsuario) throw new ForbiddenException('Usuario no autenticado');

    const qr = this.poolConexion.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const invRepo = qr.manager.getRepository(ItemInventario);
      const tiendaRepo = qr.manager.getRepository(ItemTienda);

      // 1) Trae el item inventario con relaciones
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
      });
      const yaPosee = new Set<number>(
        invUser.map(i => i.item?.codItem).filter(Boolean) as number[]
      );

      // 4) Genera recompensas
      type Drop = { codItem: number; nombre: string; tipo: string; cantidad: number };
      const rewards: Drop[] = [];
      const MAX_REINTENTOS_ROPA = 6;

      for (let k = 0; k < count; k++) {
        // preferimos potenciadores para evitar atorar por ropa duplicada
        let drop: ItemTienda | null = null;
        let intentos = 0;

        while (intentos < MAX_REINTENTOS_ROPA) {
          const idx = randomInt(0, elegibles.length); // [0, len)
          const candidato = elegibles[idx];
          const isRopa = String(candidato.tipoItem).toUpperCase() === 'ROPA';
          if (isRopa && yaPosee.has(candidato.codItem)) {
            intentos++;
            continue; // reintenta
          }
          drop = candidato;
          break;
        }

        // Si no logró una ropa válida, fuerza un potenciador
        if (!drop) {
          const soloPotenciadores = elegibles.filter(e => String(e.tipoItem).toUpperCase() === 'POTENCIADOR');
          if (soloPotenciadores.length === 0) {
            // Si ni potenciador hay, ya qué: da cualquiera que no sea cofre
            drop = elegibles[randomInt(0, elegibles.length)];
          } else {
            drop = soloPotenciadores[randomInt(0, soloPotenciadores.length)];
          }
        }

        // Empaqueta resultado
        rewards.push({
          codItem: drop.codItem,
          nombre: drop.nombreItem,
          tipo: String(drop.tipoItem).toUpperCase(),
          cantidad: 1,
        });

        // Marca ropa como "poseída" para siguientes iteraciones del mismo cofre
        if (String(drop.tipoItem).toUpperCase() === 'ROPA') {
          yaPosee.add(drop.codItem);
        }
      }

      // 5) Aplica cambios en BD:
      //   - Descontar 1 cofre
      inv.cantidad = inv.cantidad - 1;
      await invRepo.save(inv);

      //   - Upsert de recompensas
      //     (repetidos de potenciadores se suman)
      const cods = rewards.map(r => r.codItem);
      const existentes = await invRepo.find({
        where: {
          usuario: { codUsuario },
          item: { codItem: In(cods) },
        },
        relations: ['item', 'usuario'],
        lock: { mode: 'pessimistic_write' },
      });

      // Mapa para actualizar en lote
      const byItemId = new Map<number, ItemInventario>();
      existentes.forEach(row => byItemId.set(row.item.codItem, row));

      for (const r of rewards) {
        const ya = byItemId.get(r.codItem);
        if (ya) {
          ya.cantidad = ya.cantidad + r.cantidad;
          await invRepo.save(ya);
        } else {
          const nuevo = invRepo.create({
            usuario: { codUsuario } as any,
            item: { codItem: r.codItem } as any,
            cantidad: r.cantidad,
          });
          await invRepo.save(nuevo);
        }
      }

      await qr.commitTransaction();

      return {
        ok: true,
        chest: {
          codItemInventario,
          size,
          remaining: inv.cantidad,
          item: { codItem: item.codItem, nombre: item.nombreItem },
        },
        rewards,
      };
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
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