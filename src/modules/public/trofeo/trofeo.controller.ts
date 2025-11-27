// src/modules/public/trofeo/trofeo.controller.ts
import { Controller, Param, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TrofeoCron } from './trofeo.cron';
import { Trofeo } from 'src/models/trofeo/trofeo';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Trofeos')
@ApiBearerAuth('access-token') 
@Controller('trofeo')
export class TrofeoController {
  constructor(
    private readonly ds: DataSource,
    private readonly cron: TrofeoCron,
  ) {}

  // Fuerza el recálculo de un trofeo específico por código
  @Post('recompute/:codTrofeo')
  @ApiOperation({
    summary: 'Recalcular un trofeo',
    description:
      'Recalcula el trofeo indicado aplicando la misma lógica que el cron de trofeos.',
  })
  @ApiParam({
    name: 'codTrofeo',
    description: 'Código numérico del trofeo a recalcular',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Trofeo recalculado correctamente',
    schema: {
      example: { ok: true, codTrofeo: 1 },
    },
  })
  @ApiBadRequestResponse({
    description: 'El código del trofeo no es numérico o es inválido',
    schema: {
      example: { ok: false, error: 'codTrofeo inválido' },
    },
  })
  async recomputeOne(@Param('codTrofeo') codTrofeo: string) {
    const id = Number(codTrofeo);
    if (!Number.isFinite(id)) {
      return { ok: false, error: 'codTrofeo inválido' };
    }
    await this.cron.recomputeTrofeo(id);
    return { ok: true, codTrofeo: id };
  }

  // Recalcula todos los trofeos "asignables" según su nombre/regla
  @Post('recompute-all')
  @ApiOperation({
    summary: 'Recalcular todos los trofeos asignables',
    description:
      'Recalcula en bloque todos los trofeos que se consideran "asignables" según su nombre/regla interna.',
  })
  @ApiOkResponse({
    description: 'Trofeos recalculados correctamente',
    schema: {
      example: {
        ok: true,
        count: 3,
        items: [{ codTrofeo: 1 }, { codTrofeo: 2 }, { codTrofeo: 3 }],
      },
    },
  })
  async recomputeAll() {
    const trofeoRepo = this.ds.getRepository(Trofeo);
    const trofeos = await trofeoRepo.find();

    const asignables = trofeos.filter((t) => {
      const nombre = (t as any)?.nombre ?? (t as any)?.nombreTrofeo ?? '';
      // Misma heurística que el cron: detecta trofeos con regla automática
      return [
        'racha',
        'relamp',
        'rapido',
        'tiempo',
        'promedio',
        'upload',
        'retos',
        'info',
        'informacion',
      ].some((key) =>
        (nombre || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(key),
      );
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
