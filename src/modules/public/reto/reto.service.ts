// src/modules/public/reto/reto.service.ts
import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Reto } from 'src/models/reto/reto';

type RetoDTO = {
  codReto: number;
  nombreReto: string;
  descripcionReto: string | null;
  tiempoEstimadoSegReto: number | null;
  // ⬇️ ahora como string (o null) para coincidir con la entidad
  fechaInicioReto: string | null;
  fechaFinReto: string | null;
};

@Injectable()
export class RetoService {
  private readonly repo: Repository<Reto>;
  constructor(private readonly ds: DataSource) {
    this.repo = this.ds.getRepository(Reto);
  }

  private toDTO(r: Partial<Reto>): RetoDTO {
    return {
      codReto: r.codReto!,
      nombreReto: r.nombreReto!,
      descripcionReto: (r as any).descripcionReto ?? null,
      tiempoEstimadoSegReto: (r as any).tiempoEstimadoSegReto ?? null,
      fechaInicioReto: (r as any).fechaInicioReto ?? null,
      fechaFinReto: (r as any).fechaFinReto ?? null,
    };
  }

  public async listar(): Promise<RetoDTO[]> {
    const rows = await this.repo.find({
      loadEagerRelations: false,
      relations: {},
      select: {
        codReto: true,
        nombreReto: true,
        descripcionReto: true,
        tiempoEstimadoSegReto: true,
        fechaInicioReto: true,
        fechaFinReto: true,
      },
      order: { codReto: 'ASC' },
    });
    return rows.map(this.toDTO);
  }

  public async detalle(codReto: number): Promise<RetoDTO> {
    const reto = await this.repo.findOne({
      where: { codReto },
      loadEagerRelations: false,
      relations: {},
      select: {
        codReto: true,
        nombreReto: true,
        descripcionReto: true,
        tiempoEstimadoSegReto: true,
        fechaInicioReto: true,
        fechaFinReto: true,
      },
    });
    if (!reto) throw new NotFoundException('Reto no encontrado');
    return this.toDTO(reto);
  }

  public async crear(payload: Partial<Reto>): Promise<RetoDTO> {
    try {
      const clean = this.cleanPayload(payload);

      if (!clean.nombreReto?.trim()) {
        throw new HttpException('nombreReto es requerido', HttpStatus.BAD_REQUEST);
      }
      if (
        clean.fechaInicioReto &&
        clean.fechaFinReto &&
        new Date(clean.fechaFinReto) < new Date(clean.fechaInicioReto)
      ) {
        throw new HttpException('fechaFinReto no puede ser anterior a fechaInicioReto', HttpStatus.BAD_REQUEST);
      }
      if (clean.tiempoEstimadoSegReto != null && clean.tiempoEstimadoSegReto < 0) {
        throw new HttpException('tiempoEstimadoSegReto debe ser >= 0', HttpStatus.BAD_REQUEST);
      }

      const reto = this.repo.create(clean as Partial<Reto>);
      const saved = await this.repo.save(reto);

      const fresh = await this.repo.findOne({
        where: { codReto: saved.codReto },
        loadEagerRelations: false,
        relations: {},
        select: {
          codReto: true,
          nombreReto: true,
          descripcionReto: true,
          tiempoEstimadoSegReto: true,
          fechaInicioReto: true,
          fechaFinReto: true,
        },
      });
      return this.toDTO(fresh!);
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new HttpException('Reto duplicado', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('No se pudo crear el reto', HttpStatus.BAD_REQUEST);
    }
  }

  public async borrar(codReto: number): Promise<{ ok: true }> {
    const r = await this.repo.delete({ codReto });
    if (!r.affected) throw new NotFoundException('Reto no encontrado');
    return { ok: true };
  }

  // ------- helpers -------
  private cleanPayload(p: any): Partial<Reto> {
    const nombreReto: string | undefined = p?.nombreReto ?? p?.nombre_reto;
    const descripcionReto: string | null =
      (p?.descripcionReto ?? p?.descripcion_reto ?? null) || null;

    const tiempoEstimadoSegReto: number | null = toIntOrNull(
      p?.tiempoEstimadoSegReto ?? p?.tiempo_estimado_seg_reto,
    );

    // ⬇️ convertimos a string MySQL DATETIME o null
    const fechaInicioReto: string | null = toMySqlDateTimeOrNull(
      p?.fechaInicioReto ?? p?.fecha_inicio_reto,
    );
    const fechaFinReto: string | null = toMySqlDateTimeOrNull(
      p?.fechaFinReto ?? p?.fecha_fin_reto,
    );

    return {
      nombreReto,
      descripcionReto,
      tiempoEstimadoSegReto,
      fechaInicioReto,
      fechaFinReto,
    } as Partial<Reto>;
  }
}

function toIntOrNull(v: any): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

// Devuelve 'YYYY-MM-DD HH:mm:ss' o null
function toMySqlDateTimeOrNull(v: any): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}
