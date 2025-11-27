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
  /** Repositorio principal de ítems de inventario. */
  private repo: Repository<ItemInventario>;

  constructor(private readonly poolConexion: DataSource) {
    this.repo = poolConexion.getRepository(ItemInventario);
  }

  // GET /item-inventario/listar
  /** Lista todos los ítems de inventario (uso general / administrativo). */
  public async listar(): Promise<ItemInventario[]> {
    return this.repo.find({ order: { codItemInventario: 'ASC' } });
  }

  // GET /item-inventario/:id
  /** Obtiene un ítem de inventario por su ID, o lanza 404 si no existe. */
  public async obtenerPorId(id: number): Promise<ItemInventario> {
    const item = await this.repo.findOne({ where: { codItemInventario: id } });
    if (!item) throw new NotFoundException(`ItemInventario ${id} no existe`);
    return item;
  }

  /** Lista todos los ítems de inventario pertenecientes a un usuario. */
  async listarMisItems(codUsuario: number) {
    return await this.repo.find({
      where: { usuario: { codUsuario } }, // usa la relación con Usuario
      relations: ['usuario', 'item'],
      order: { fechaCompra: 'DESC' },
    });
  }

  // ==========================
  // ===    ABRIR COFRE     ===
  // ==========================
  /**
   * Lógica principal de apertura de cofre:
   * - Valida propiedad y stock del cofre.
   * - Calcula tamaño → cantidad de drops.
   * - Sortea recompensas (evitando ropa repetida siempre que se pueda).
   * - Fusiona recompensas repetidas y actualiza inventario en una transacción.
   */
  public async abrirCofre(codUsuario: number, codItemInventario: number) {
    if (!codUsuario) throw new ForbiddenException('Usuario no autenticado');

    const intento = async () => {
      const qr = this.poolConexion.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();

      try {
        const invRepo = qr.manager.getRepository(ItemInventario);
        const tiendaRepo = qr.manager.getRepository(ItemTienda);

        // 1) Trae el ítem de inventario con lock para evitar carreras.
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

        // 2) Determina tamaño del cofre → número de drops.
        const size = this.detectChestSize(item);
        const count = size === 'pequeno' ? 1 : size === 'medio' ? 5 : 10;

        // 3) Arma el pool de loot (se excluyen cofres para evitar cascadas infinitas).
        const pool = await tiendaRepo.find();
        const elegibles = pool.filter(
          (p) => String(p.tipoItem).toUpperCase() !== 'COFRE',
        );
        if (elegibles.length === 0) {
          throw new InternalServerErrorException('No hay recompensas elegibles');
        }

        // Inventario actual del usuario, para evitar dar ropa duplicada cuando sea posible.
        const invUser = await invRepo.find({
          where: { usuario: { codUsuario } },
          relations: ['item'],
          lock: { mode: 'pessimistic_read' }, // lectura consistente
        });
        const yaPosee = new Set<number>(
          invUser.map((i) => i.item?.codItem).filter(Boolean) as number[],
        );

        type Drop = { codItem: number; nombre: string; tipo: string; cantidad: number };

        // 4) Genera drops “crudos”; luego se fusionan por ítem.
        const rawRewards: Drop[] = [];
        const MAX_REINTENTOS_ROPA = 6;

        for (let k = 0; k < count; k++) {
          let drop: ItemTienda | null = null;
          let intentos = 0;

          // Se intenta evitar ropa repetida hasta cierto límite de reintentos.
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

          // Fallback a potenciadores (o cualquier elegible) si no hubo ropa válida.
          if (!drop) {
            const soloPotenciadores = elegibles.filter(
              (e) => String(e.tipoItem).toUpperCase() === 'POTENCIADOR',
            );
            drop =
              soloPotenciadores.length > 0
                ? soloPotenciadores[randomInt(0, soloPotenciadores.length)]
                : elegibles[randomInt(0, elegibles.length)];
          }

          rawRewards.push({
            codItem: drop.codItem,
            nombre: drop.nombreItem,
            tipo: String(drop.tipoItem).toUpperCase(),
            cantidad: 1,
          });

          // A partir de este punto, la ropa ya se considera “poseída”.
          if (String(drop.tipoItem).toUpperCase() === 'ROPA') {
            yaPosee.add(drop.codItem);
          }
        }

        // 5) Fusión en memoria: agrupa por codItem para que no haya duplicados en la respuesta.
        const rewardsMap = new Map<number, Drop>();
        for (const r of rawRewards) {
          const prev = rewardsMap.get(r.codItem);
          if (prev) {
            prev.cantidad += r.cantidad;
          } else {
            rewardsMap.set(r.codItem, { ...r });
          }
        }
        const rewards = Array.from(rewardsMap.values());

        // 6) Aplica cambios en BD dentro de la misma transacción:
        //    - Descuenta 1 cofre.
        inv.cantidad = inv.cantidad - 1;
        await invRepo.save(inv);

        //    - “Upsert manual” de las recompensas (lock pesimista por usuario).
        const cods = rewards.map((r) => r.codItem);
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

        // 7) Respuesta final: cofre actualizado + recompensas fusionadas.
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
      } catch (e: any) {
        try {
          await qr.rollbackTransaction();
        } catch {}
        throw e;
      } finally {
        try {
          await qr.release();
        } catch {}
      }
    };

    // Reintento suave si la BD se queja por clave única (carrera al crear ítems).
    try {
      return await intento();
    } catch (e: any) {
      if (e?.errno === 1062 || e?.code === 'ER_DUP_ENTRY') {
        // Segundo intento: ya debería encontrar los registros existentes y sumar.
        return await intento();
      }
      throw e;
    }
  }

  /**
   * Determina el “tamaño” del cofre:
   * - Primero intenta por nombre.
   * - Si no matchea, usa precio como heurística.
   */
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

  //   // POST /item-inventario/crear
  //   public async crear(body: any): Promise<ItemInventario> { ... }

  //   // PUT /item-inventario/:id
  //   public async actualizar(id: number, body: any): Promise<ItemInventario> { ... }

  //   // DELETE /item-inventario/:id
  //   public async eliminar(id: number): Promise<void> { ... }

  //   // private handleDbError(e: any, action: string): never { ... }
}
