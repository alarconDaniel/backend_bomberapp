// src/modules/public/reto/reto.service.ts
import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Reto } from 'src/models/reto/reto';

@Injectable()
export class RetoService {
  private readonly repo: Repository<Reto>;

  constructor(private readonly ds: DataSource) {
    this.repo = this.ds.getRepository(Reto);
  }

  /**
   * Lista de retos (array). Selecciona solo columnas necesarias.
   */
  public listar(): Promise<Partial<Reto>[]> {
    return this.repo.find({
      select: [
        'codReto',
        'nombreReto',
        'descripcionReto',
        'tiempoEstimadoSegReto',
        'fechaInicioReto',
        'fechaFinReto',
      ],
      order: { codReto: 'ASC' },
    });
  }

  /**
   * Crear reto. Devuelve el registro guardado (sin transformaciones).
   */
  public async crear(payload: Partial<Reto>): Promise<Partial<Reto>> {
    try {
      const reto = this.repo.create(payload as Reto);
      const saved = await this.repo.save(reto);
      return saved; // Reto es compatible con Partial<Reto>
    } catch (e: any) {
      throw new HttpException('No se pudo crear el reto', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Borrar reto por ID.
   */
  public async borrar(codReto: number): Promise<{ ok: true }> {
    const r = await this.repo.delete({ codReto });
    if (!r.affected) throw new NotFoundException('Reto no encontrado');
    return { ok: true };
  }

  /**
   * Detalle de reto por ID.
   */
  public async detalle(codReto: number): Promise<Partial<Reto>> {
    const reto = await this.repo.findOne({
      where: { codReto },
      select: [
        'codReto',
        'nombreReto',
        'descripcionReto',
        'tiempoEstimadoSegReto',
        'fechaInicioReto',
        'fechaFinReto',
      ],
    });
    if (!reto) throw new NotFoundException('Reto no encontrado');
    return reto;
  }
}
