// src/modules/public/trofeo/trofeo.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, EntityManager } from 'typeorm';

import { Trofeo } from 'src/models/trofeo/trofeo';
import { Usuario } from 'src/models/usuario/usuario';
import { AuditoriaTrofeo } from 'src/models/auditoria-trofeo/auditoria-trofeo';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';

type Ganador = {
  codUsuario: number | null;
  motivo: string;
  metricas?: Record<string, any> | null;
};

function norm(s?: string) {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim();
}

type TrofeoKind = 'RACHA' | 'VEL_PROM' | 'UPLOAD';

function pickTrofeoKind(nombre: string): TrofeoKind | null {
  const n = norm(nombre);
  if (n.includes('racha')) return 'RACHA'; // Racha Imparable
  if (n.includes('relamp') || n.includes('rapido') || n.includes('tiempo') || n.includes('promedio')) return 'VEL_PROM'; // Relámpago
  if (n.includes('upload') || n.includes('retos') || n.includes('info') || n.includes('informacion')) return 'UPLOAD'; // Upload ON
  return null;
}

@Injectable()
export class TrofeoCron {
  private readonly log = new Logger(TrofeoCron.name);

  constructor(private readonly ds: DataSource) {}

  // 10pm hora de Bogotá
  @Cron(CronExpression.EVERY_DAY_AT_10PM, { timeZone: 'America/Bogota' })
  async refresh() {
    const trofeoRepo = this.ds.getRepository(Trofeo);
    const trofeos = await trofeoRepo.find();

    for (const t of trofeos) {
      try {
        const nombre = (t as any)?.nombre ?? (t as any)?.nombreTrofeo ?? '';
        const kind = pickTrofeoKind(nombre);
        if (!kind) {
          this.log.debug(`Trofeo ${t['codTrofeo'] ?? (t as any)?.cod_trofeo ?? '?'} ignora (sin regla): ${nombre}`);
          continue;
        }
        await this.recomputeTrofeo(t['codTrofeo'] ?? (t as any)?.cod_trofeo);
      } catch (e) {
        this.log.error(
          `Falló trofeo ${(t as any)?.codTrofeo ?? (t as any)?.cod_trofeo} (${(t as any)?.nombre ?? (t as any)?.nombreTrofeo}): ${(e as Error)?.message}`,
        );
      }
    }
  }

  // Invocable desde endpoint
  async recomputeTrofeo(codTrofeo: number) {
    if (!codTrofeo) return;

    await this.ds.transaction('READ COMMITTED', async (trx: EntityManager) => {
      const trofeoRepo = trx.getRepository(Trofeo);
      const userRepo = trx.getRepository(Usuario);
      const auditRepo = trx.getRepository(AuditoriaTrofeo);

      // 1) Lock
      const trofeo = await trofeoRepo
        .createQueryBuilder('t')
        .setLock('pessimistic_write')
        .where('t.codTrofeo = :id', { id: codTrofeo })
        .getOne();

      if (!trofeo) return;

      const nombre = (trofeo as any)?.nombre ?? (trofeo as any)?.nombreTrofeo ?? '';
      const kind = pickTrofeoKind(nombre);
      if (!kind) return;

      // 2) Resolver ganador
      const ganador = await this.resolverGanador(trx, kind);
      if (!ganador.codUsuario) return;

      // 3) Dueño previo (la relación es eager en tu entity)
      const prevId: number | null = (trofeo as any)?.dueño?.codUsuario ?? null;
      const nextId = ganador.codUsuario;

      if (prevId === nextId) return; // sin cambios

      // 4) Cargar usuarios para auditoría
      const nextUser = await userRepo.findOne({ where: { codUsuario: nextId } });
      const prevUser = prevId ? await userRepo.findOne({ where: { codUsuario: prevId } }) : null;

      // 5) Actualizar dueño (NO intentes setear codUsuario: no es propiedad mapeable)
      await trofeoRepo.update(
        { codTrofeo },
        (nextUser ? { ['dueño' as any]: nextUser } : { ['dueño' as any]: null }) as any
      );

      // 6) Auditoría
      const audit = auditRepo.create({
        trofeo,
        prevUsuario: prevUser ?? null,
        newUsuario: nextUser ?? null,
        motivo: ganador.motivo,
        metricas: ganador.metricas ?? null,
        cambiadoEn: new Date(),
      } as any);
      await auditRepo.save(audit);

      this.log.log(`Trofeo ${codTrofeo} → ${nombre} reasignado a usuario ${nextId} por ${ganador.motivo}`);
    });
  }

  // Reglas
  private async resolverGanador(trx: EntityManager, kind: TrofeoKind): Promise<Ganador> {
    switch (kind) {
      case 'RACHA': {
        // Racha Imparable → racha ACTUAL (estadisticas_usuarios.racha_estadistica)
        const row = await trx
          .getRepository(EstadisticaUsuario)
          .createQueryBuilder('eu')
          .leftJoin('eu.usuario', 'u')
          .select('eu.racha', 'racha')               // entity: racha ↔ DB: racha_estadistica
          .addSelect('u.codUsuario', 'codUsuario')
          .orderBy('eu.racha', 'DESC')
          .addOrderBy('u.codUsuario', 'ASC')
          .limit(1)
          .getRawOne<{ racha: number; codUsuario: number }>();

        return {
          codUsuario: row?.codUsuario ?? null,
          motivo: 'mayor_racha_actual',
          metricas: { racha_actual: row?.racha ?? 0 },
        };
      }

      case 'VEL_PROM': {
        // Relámpago en la Cabeza → menor tiempo promedio
        const rows = await trx.query(`
          SELECT
            ur.cod_usuario AS codUsuario,
            AVG(ur.tiempo_complecion_seg) AS avgSeg,
            COUNT(*) AS completados
          FROM usuarios_retos ur
          WHERE ur.estado = 'completado'
            AND ur.tiempo_complecion_seg IS NOT NULL
          GROUP BY ur.cod_usuario
          HAVING completados >= 1
          ORDER BY avgSeg ASC, codUsuario ASC
          LIMIT 1
        `);

        const codUsuario = rows?.[0]?.codUsuario ?? null;
        const avgSeg = rows?.[0]?.avgSeg ?? null;
        const completados = rows?.[0]?.completados ?? 0;

        return {
          codUsuario,
          motivo: 'menor_tiempo_promedio',
          metricas: { promedio_segundos: avgSeg, completados },
        };
      }

      case 'UPLOAD': {
        // Modo Upload: ON → más retos completados
        const rows = await trx.query(`
          SELECT
            ur.cod_usuario AS codUsuario,
            COUNT(*) AS completados
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
    }

    return { codUsuario: null, motivo: 'sin_regla', metricas: null };
  }
}
