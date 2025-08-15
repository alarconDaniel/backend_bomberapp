import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException, // ⬅️ añade este
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ItemInventario } from 'src/models/item-inventario/item-inventario';

@Injectable()
export class ItemInventarioService {
  private repo: Repository<ItemInventario>;

  constructor(private readonly poolConexion: DataSource) {
    this.repo = poolConexion.getRepository(ItemInventario);
  }

  // GET /item-inventario/listar
  public async listar(): Promise<ItemInventario[]> {
    return this.repo.find({ order: { cod_item_inventario: 'ASC' } });
  }

  // GET /item-inventario/:id
  public async obtenerPorId(id: number): Promise<ItemInventario> {
    const item = await this.repo.findOne({ where: { cod_item_inventario: id } });
    if (!item) throw new NotFoundException(`ItemInventario ${id} no existe`);
    return item;
  }

  // GET /item-inventario/usuario/:cod_usuario
  public async listarPorUsuario(codUsuario: number): Promise<ItemInventario[]> {
    return this.repo.find({
      where: { cod_usuario: codUsuario },
      order: { fecha_compra_item: 'DESC' },
    });
  }

// POST /item-inventario/crear
public async crear(body: any): Promise<ItemInventario> {
  try {
    const entity = this.repo.create({
      cod_usuario: body.cod_usuario,
      cod_item: body.cod_item,
      cantidad_item: body.cantidad_item,
      ...(body.fecha_compra_item && { fecha_compra_item: body.fecha_compra_item }),
    });

    // 1) insert robusto (evita ambigüedades de save)
    const res = await this.repo.insert(entity);

    // 2) obtén el ID (TypeORM + MySQL: identifiers[0] y/o raw.insertId)
    const id =
      (res.identifiers?.[0]?.cod_item_inventario as number | undefined) ??
      (res.raw?.insertId as number | undefined);

    if (!id) {
      throw new InternalServerErrorException(
        'No se pudo obtener el ID del item recién creado',
      );
    }

    // 3) devuelve el registro tal como quedó en BD
    return this.obtenerPorId(id);
  } catch (e: any) {
    this.handleDbError(e, 'crear');
  }
}


  // PUT /item-inventario/:id
  public async actualizar(id: number, body: any): Promise<ItemInventario> {
    const existing = await this.obtenerPorId(id);
    try {
      const merged = this.repo.merge(existing, {
        ...(body.cantidad_item !== undefined && { cantidad_item: body.cantidad_item }),
        ...(body.fecha_compra_item !== undefined && { fecha_compra_item: body.fecha_compra_item }),
      });
      await this.repo.save(merged);
      return this.obtenerPorId(id);
    } catch (e: any) {
      this.handleDbError(e, 'actualizar');
    }
  }

  // DELETE /item-inventario/:id
  public async eliminar(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`ItemInventario ${id} no existe`);
  }

  // --- Helpers ---
  private handleDbError(e: any, action: string): never {
    if (e?.errno === 1452) {
      throw new BadRequestException(`No se pudo ${action}: referencia inválida (FK cod_usuario/cod_item).`);
    }
    if (e?.errno === 1366) {
      throw new BadRequestException(`No se pudo ${action}: valor/tipo inválido.`);
    }
    throw new BadRequestException(`No se pudo ${action}: ${e?.message || 'Error de base de datos'}`);
  }
}
