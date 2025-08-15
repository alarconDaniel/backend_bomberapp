// src/services/reto/reto.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Reto } from 'src/models/reto/reto';

@Injectable()
export class RetoService {
  private retoRepository: Repository<Reto>;

  constructor(private poolConexion: DataSource) {
    this.retoRepository = poolConexion.getRepository(Reto);
  }

  // GET: lista simple
  public async listarRetos(): Promise<Reto[]> {
    return await this.retoRepository.find();
  }

  // GET: detalle por id
  public async buscarReto(codReto: number): Promise<Reto> {
    const reto = await this.retoRepository.findOneBy({ codReto });
    if (!reto) {
      throw new HttpException('Reto no encontrado', HttpStatus.NOT_FOUND);
    }
    return reto;
  }

  // POST: crear
  public async crearReto(objReto: Reto): Promise<Reto> {
    try {
      return await this.retoRepository.save(objReto);
    } catch (err) {
      throw new HttpException('Falla al registrar', HttpStatus.BAD_REQUEST);
    }
  }

  // PUT: actualizar
  public async modificarReto(objActualizar: Reto): Promise<any> {
    try {
      if (!objActualizar.codReto) {
        throw new HttpException('codReto es requerido', HttpStatus.BAD_REQUEST);
      }
      const { codReto } = objActualizar;
      const result = await this.retoRepository.update({ codReto }, objActualizar);

      if (result.affected === 0) {
        throw new HttpException('Reto no encontrado', HttpStatus.NOT_FOUND);
      }
      return result; // UpdateResult
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('No se actualiza', HttpStatus.BAD_REQUEST);
    }
  }

  // DELETE: borrar
  public async borrarReto(codReto: number): Promise<any> {
    try {
      const result = await this.retoRepository.delete({ codReto });
      if (result.affected === 0) {
        throw new HttpException('Reto no encontrado', HttpStatus.NOT_FOUND);
      }
      return result; // DeleteResult
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('No se borra', HttpStatus.BAD_REQUEST);
    }
  }

  // Listado paginado + búsqueda por nombre/descripcion
  public async listarPaginado(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{ data: Reto[]; total: number; page: number; limit: number }> {
    // Sanitiza page/limit
    page = Math.max(1, Number(page) || 1);
    limit = Math.max(1, Math.min(100, Number(limit) || 10));

    const where: FindOptionsWhere<Reto>[] | undefined = search
      ? [
          { nombreReto: ILike(`%${search}%`) },
          { descripcionReto: ILike(`%${search}%`) },
        ]
      : undefined;

    const [data, total] = await this.retoRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { codReto: 'DESC' },
    });

    return { data, total, page, limit };
  }
}
