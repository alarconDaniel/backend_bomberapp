import { Pregunta } from './../../../models/pregunta/pregunta';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreatePreguntaDto } from './dto/create-pregunta.dto';
import { UpdatePreguntaDto } from './dto/update-pregunta.dto';

@Injectable()
export class PreguntasService {
  constructor(
    @InjectRepository(Pregunta)
    private readonly repo: Repository<Pregunta>,
  ) {}

  /**
   * Calcula el próximo número de orden dentro de un reto (MAX(numero_pregunta) + 1).
   */
  private async nextOrden(codReto: number): Promise<number> {
    const row = await this.repo
      .createQueryBuilder('p')
      .select('MAX(p.numeroPregunta)', 'max')
      .where('p.codReto = :codReto', { codReto })
      .getRawOne<{ max: number | null }>();

    return (row?.max ?? 0) + 1;
  }

  /**
   * Crea una pregunta; si no se envía numeroPregunta, se asigna el siguiente
   * orden disponible dentro del reto.
   */
  async create(dto: CreatePreguntaDto) {
    const numero = dto.numeroPregunta ?? (await this.nextOrden(dto.codReto));

    const entity = this.repo.create({
      codReto: dto.codReto,
      numeroPregunta: numero,
      enunciado: dto.enunciado,
      tipo: dto.tipo,
      puntos: dto.puntos,
      tiempoMax: dto.tiempoMax,
    });

    return this.repo.save(entity);
  }

  /**
   * Lista todas las preguntas de un reto, ordenadas por numeroPregunta.
   */
  findAllByReto(codReto: number) {
    return this.repo.find({
      where: { codReto } as FindOptionsWhere<Pregunta>,
      order: { numeroPregunta: 'ASC' },
    });
  }

  /**
   * Obtiene una pregunta por su PK; lanza 404 si no existe.
   */
  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { codPregunta: id } });
    if (!found) throw new NotFoundException('Pregunta no encontrada');
    return found;
  }

  /**
   * Actualiza una pregunta con campos parciales del DTO.
   */
  async update(id: number, dto: UpdatePreguntaDto) {
    const current = await this.findOne(id);

    Object.assign(current, {
      ...(dto.codReto !== undefined ? { codReto: dto.codReto } : {}),
      ...(dto.numeroPregunta !== undefined ? { numeroPregunta: dto.numeroPregunta } : {}),
      ...(dto.enunciado !== undefined ? { enunciado: dto.enunciado } : {}),
      ...(dto.tipo !== undefined ? { tipo: dto.tipo } : {}),
      ...(dto.puntos !== undefined ? { puntos: dto.puntos } : {}),
      ...(dto.tiempoMax !== undefined ? { tiempoMax: dto.tiempoMax } : {}),
    });

    return this.repo.save(current);
  }

  /**
   * Elimina una pregunta por id; responde ok si la operación fue exitosa.
   */
  async remove(id: number) {
    const current = await this.findOne(id);
    await this.repo.remove(current);
    return { ok: true };
  }

  /**
   * Intercambia el número de orden entre dos preguntas de un mismo reto.
   * Se buscan por (codReto, numeroPregunta = a/b) y se swapéan los valores.
   */
  async swapOrden(codReto: number, a: number, b: number) {
    const [pa, pb] = await Promise.all([
      this.repo.findOne({ where: { codReto, numeroPregunta: a } }),
      this.repo.findOne({ where: { codReto, numeroPregunta: b } }),
    ]);

    if (!pa || !pb) {
      throw new NotFoundException('Alguna pregunta no existe en ese reto');
    }

    const tmp = pa.numeroPregunta;
    pa.numeroPregunta = pb.numeroPregunta;
    pb.numeroPregunta = tmp;

    await this.repo.save([pa, pb]);

    return { ok: true };
  }
}
