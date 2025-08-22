// src/modules/public/trofeo/trofeo.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, EntityManager } from 'typeorm';

import { Trofeo } from 'src/models/trofeo/trofeo';
import { Usuario } from 'src/models/usuario/usuario';
import { AuditoriaTrofeo } from 'src/models/auditoria-trofeo/auditoria-trofeo';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';

type Ganador = { codUsuario: number | null; motivo: string; metricas?: any };

@Injectable()
export class TrofeoCron {
  private readonly log = new Logger(TrofeoCron.name);

  constructor(private readonly ds: DataSource) {}

  @Cron(CronExpression.EVERY_DAY_AT_10PM) // luego súbelo a cada 5/15 min
  async refresh() {
    const trofeoRepo = this.ds.getRepository(Trofeo);
    const trofeos = await trofeoRepo.find();

    for (const t of trofeos) {
      try {
        await this.recomputeTrofeo(t.codTrofeo);
      } catch (e) {
        this.log.error(`Falló trofeo ${t.codTrofeo} (${t.nombre}): ${(e as Error)?.message}`);
      }
    }
  }

  private async recomputeTrofeo(codTrofeo: number) {
    await this.ds.transaction('READ COMMITTED', async (trx: EntityManager) => {
      const trofeoRepo = trx.getRepository(Trofeo);
      const userRepo = trx.getRepository(Usuario);
      const auditRepo = trx.getRepository(AuditoriaTrofeo);

      // 1) Lock fila del trofeo
      const trofeo = await trofeoRepo
        .createQueryBuilder('t')
        .setLock('pessimistic_write')
        .where('t.codTrofeo = :id', { id: codTrofeo })
        .getOne();

      if (!trofeo) return;

      // 2) Resolver ganador por regla
      const ganador = await this.resolverGanador(trx, trofeo.nombre);
      if (!ganador.codUsuario) return;

      const prevId = trofeo.dueño?.codUsuario ?? null;
      const nextId = ganador.codUsuario;
      if (prevId === nextId) return;

      // 3) Cargar usuarios (para auditoría)
      const nextUser = await userRepo.findOne({ where: { codUsuario: nextId } });
      const prevUser = prevId ? await userRepo.findOne({ where: { codUsuario: prevId } }) : null;

      // 4) Actualizar dueño
      await trofeoRepo.update({ codTrofeo }, { dueño: nextUser ?? null });

      // 5) Auditoría
      const audit = auditRepo.create({
        trofeo,
        prevUsuario: prevUser ?? null,
        newUsuario: nextUser ?? null,
        motivo: ganador.motivo,
        metricas: ganador.metricas ?? null,
      });
      await auditRepo.save(audit);
    });
  }

  private async resolverGanador(trx: EntityManager, nombre: string): Promise<Ganador> {
    const n = (nombre || '').toLowerCase();

    // 1) Mayor racha
    if (n.includes('racha')) {
      const row = await trx
        .getRepository(EstadisticaUsuario)
        .createQueryBuilder('eu')
        .leftJoin('eu.usuario', 'u')
        .select('eu.racha', 'racha')
        .addSelect('u.codUsuario', 'codUsuario')
        .orderBy('eu.racha', 'DESC')
        .addOrderBy('u.codUsuario', 'ASC')
        .limit(1)
        .getRawOne<{ racha: number; codUsuario: number }>();

      return {
        codUsuario: row?.codUsuario ?? null,
        motivo: 'mayor_racha',
        metricas: { racha: row?.racha ?? 0 },
      };
    }

    // 2) Menor tiempo promedio resolviendo retos
    if (n.includes('tiempo') || n.includes('rápido') || n.includes('promedio')) {
      const rows = await trx.query(`
        SELECT ur.cod_usuario AS codUsuario, AVG(ur.tiempo_complecion_seg) AS avgSeg
          FROM usuarios_retos ur
         WHERE ur.estado = 'completado' AND ur.tiempo_complecion_seg IS NOT NULL
      GROUP BY ur.cod_usuario
      HAVING COUNT(*) >= 1
      ORDER BY avgSeg ASC, codUsuario ASC
         LIMIT 1
      `);

      const codUsuario = rows?.[0]?.codUsuario ?? null;
      const avgSeg = rows?.[0]?.avgSeg ?? null;

      return {
        codUsuario,
        motivo: 'menor_tiempo_promedio',
        metricas: { promedio_segundos: avgSeg },
      };
    }

    // 3) Más retos completados (quien más “sube info”)
    if (n.includes('más suba información') || n.includes('más retos') || n.includes('mas retos')) {
      const rows = await trx.query(`
        SELECT ur.cod_usuario AS codUsuario, COUNT(*) AS completados
          FROM usuarios_retos ur
         WHERE ur.estado = 'completado'
      GROUP BY ur.cod_usuario
      ORDER BY completados DESC, codUsuario ASC
         LIMIT 1
      `);

      const codUsuario = rows?.[0]?.codUsuario ?? null;
      const completados = rows?.[0]?.completados ?? 0;

      return {
        codUsuario,
        motivo: 'mas_retos_completados',
        metricas: { completados },
      };
    }

    // otras categorías futuras…
    return { codUsuario: null, motivo: 'sin_regla' };
  }
}
