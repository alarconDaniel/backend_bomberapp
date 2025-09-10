// src/modules/public/trofeo/trofeo.controller.ts
import { Controller, Param, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TrofeoCron } from './trofeo.cron';
import { Trofeo } from 'src/models/trofeo/trofeo';

@Controller('trofeo')
export class TrofeoController {
  constructor(
    private readonly ds: DataSource,
    private readonly cron: TrofeoCron,
  ) {}

  // Recalcula SOLO el trofeo indicado
  @Post('recompute/:codTrofeo')
  async recomputeOne(@Param('codTrofeo') codTrofeo: string) {
    const id = Number(codTrofeo);
    if (!Number.isFinite(id)) {
      return { ok: false, error: 'codTrofeo inválido' };
    }
    await this.cron.recomputeTrofeo(id);
    return { ok: true, codTrofeo: id };
  }

  // Recalcula todos los trofeos "asignables" (los 3 con regla)
  @Post('recompute-all')
  async recomputeAll() {
    const trofeoRepo = this.ds.getRepository(Trofeo);
    const trofeos = await trofeoRepo.find();

    const asignables = trofeos.filter(t => {
      const nombre = (t as any)?.nombre ?? (t as any)?.nombreTrofeo ?? '';
      // Usa el mismo discriminador de reglas que el cron
      return ['racha', 'relamp', 'rapido', 'tiempo', 'promedio', 'upload', 'retos', 'info', 'informacion']
        .some(key => (nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(key));
    });

    const results: Array<{ codTrofeo: number }> = [];
    for (const t of asignables) {
      const id = (t as any)?.codTrofeo ?? (t as any)?.cod_trofeo;
      if (!id) continue;
      await this.cron.recomputeTrofeo(id);
      results.push({ codTrofeo: id });
    }

    return { ok: true, count: results.length, items: results };
  }
}
