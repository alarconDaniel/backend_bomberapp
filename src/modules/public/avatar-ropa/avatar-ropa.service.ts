// src/modules/avatar-ropa/avatar-ropa.service.ts
import {
  BadRequestException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { AvatarEquipado } from 'src/models/avatar-equipado/avatar-equipado';
import { ItemInventario } from 'src/models/item_inventario/item_inventario';
import { ItemTienda } from 'src/models/item-tienda/item-tienda';
import { SaveAvatarDto } from './dto/save-avatar.dto';
import { Slot, ALL_SLOTS } from 'src/common/slots.enum';

@Injectable()
export class AvatarRopaService {
  /** Repositorios usados para leer/escribir estado de avatar e inventario. */
  private repoAE: Repository<AvatarEquipado>;
  private repoInv: Repository<ItemInventario>;
  private repoTienda: Repository<ItemTienda>;

  /**
   * Se inyecta el DataSource principal y se inicializan los repos directamente.
   * Esto permite usar el mismo DataSource también dentro de transacciones manuales.
   */
  constructor(private readonly ds: DataSource) {
    this.repoAE = ds.getRepository(AvatarEquipado);
    this.repoInv = ds.getRepository(ItemInventario);
    this.repoTienda = ds.getRepository(ItemTienda);
  }

  /** Devuelve el estado actual del avatar:
   *  - slots: cod_item_inventario por cada Slot (o null)
   *  - equipped: lista plana de ids equipados
   */
  async getEquipada(codUsuario: number) {
    const rows = await this.repoAE.find({ where: { codUsuario } });

    const slots: Record<Slot, number | null> = {
      [Slot.CABEZA]: null, [Slot.TORSO]: null, [Slot.PIERNAS]: null, [Slot.PIES]: null, [Slot.EXTRA]: null,
    };
    for (const r of rows) slots[r.slot] = r.codItemInventario ?? null;

    const equipped = Object.values(slots).filter(Boolean) as number[];
    return { slots, equipped };
  }

  /** Guarda TODOS los slots en una transacción atómica */
  async guardar(codUsuario: number, dto: SaveAvatarDto) {
    if (!codUsuario) throw new ForbiddenException('No autenticado');

    // Normaliza payload: sólo slots válidos, resto = null (idempotente)
    const incoming: Record<Slot, number | null> = {
      [Slot.CABEZA]: null, [Slot.TORSO]: null, [Slot.PIERNAS]: null, [Slot.PIES]: null, [Slot.EXTRA]: null,
    };
    for (const s of ALL_SLOTS) {
      const v = (dto?.slots ?? ({} as any))[s];
      incoming[s] = (v === null || v === undefined) ? null : Number(v);
    }

    // Uso explícito de queryRunner para tener control total de la transacción.
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // 1) Carga todos los items referenciados para validar (una sola query, lock de lectura)
      const referenciados = Object.values(incoming).filter((v): v is number => Number.isInteger(v));
      const invs = referenciados.length
        ? await qr.manager.getRepository(ItemInventario).find({
            where: { codItemInventario: In(referenciados) },
            relations: ['usuario', 'item'],
            lock: { mode: 'pessimistic_read' },
          })
        : [];

      const invById = new Map(invs.map(i => [i.codItemInventario, i]));

      // 2) Validaciones por slot (propietario, tipo, stock, slot compatible)
      for (const slot of ALL_SLOTS) {
        const cod = incoming[slot];
        if (cod == null) continue;

        const inv = invById.get(cod);
        if (!inv) throw new NotFoundException(`ItemInventario ${cod} no existe`);
        if (Number(inv.usuario?.codUsuario) !== Number(codUsuario)) {
          throw new BadRequestException(`ItemInventario ${cod} no pertenece al usuario`);
        }
        const tipo = String(inv.item?.tipoItem || '').toLowerCase();
        if (tipo !== 'ropa') throw new BadRequestException(`ItemInventario ${cod} no es de tipo ROPA`);
        if ((inv.cantidad ?? 0) <= 0) throw new BadRequestException(`ItemInventario ${cod} sin stock`);

        // Si el ítem declara slot fijo, debe coincidir
        const declared = inv.item?.slotItem as Slot | null | undefined;
        if (declared && declared !== slot) {
          throw new BadRequestException(`El ítem ${cod} es para slot ${declared}, no ${slot}`);
        }
      }

      // 3) Upsert / Delete por slot en tabla AvatarEquipado (respetando constraint UNIQUE)
      const repoAE = qr.manager.getRepository(AvatarEquipado);

      for (const slot of ALL_SLOTS) {
        const cod = incoming[slot]; // number | null

        if (cod == null) {
          // limpiar slot => DELETE (cod_item_inventario suele ser NOT NULL en el esquema)
          await repoAE.delete({ codUsuario, slot });
          continue;
        }

        // Insertar o actualizar. OJO: nombres de COLUMNA en snake_case
        await repoAE
          .createQueryBuilder()
          .insert()
          .into(AvatarEquipado)
          .values({ codUsuario, slot, codItemInventario: cod })
          .orUpdate(
            ['cod_item_inventario', 'updated_at'], // columnas a sobreescribir
            ['cod_usuario', 'slot'],               // columnas que definen el conflicto (UNIQUE uq_usuario_slot)
          )
          .execute();
      }

      // Commit sólo si todo el upsert/delete se ejecutó correctamente
      await qr.commitTransaction();

      // 4) Estado final unificado que recibe el cliente tras guardar
      const { slots, equipped } = await this.getEquipada(codUsuario);
      return { ok: true, slots, equipped };
    } catch (e: any) {
      // En caso de error, revertimos todos los cambios del bloque anterior
      try { await qr.rollbackTransaction(); } catch {}
      // Dejar que BD avise si UNIQUE salta (ítem en dos slots)
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new BadRequestException('Ese ítem ya está equipado en otro slot.');
      }
      throw e;
    } finally {
      // Cerramos el queryRunner aunque algo haya fallado
      try { await qr.release(); } catch {}
    }
  }
}
