// src/modules/reto/retos.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { RetoService } from './reto.service';
import { DataSource } from 'typeorm';

@Injectable()
export class RetosCron {
  private readonly log = new Logger(RetosCron.name);
  private lastRunYmd: string | null = null; // guard in-memory por día

  constructor(
    private readonly retos: RetoService,
    private readonly ds: DataSource,
  ) {
    this.log.warn(`Instanciado RetosCron en pid=${process.pid}`);
  }

  @Cron('0 5 0 * * *', { timeZone: 'America/Bogota' })
  async tick() {
    if (process.env.ENABLE_CRONS === 'false') {
      this.log.debug('Cron deshabilitado por ENABLE_CRONS=false');
      return;
    }

    const hoy = dayjs().format('YYYY-MM-DD');

    // 👇 Guard in-memory por proceso (por si hay múltiples registros del cron)
    if (this.lastRunYmd === hoy) {
      this.log.warn(`Ya corrí hoy en este proceso, salto: ${hoy}`);
      return;
    }

    const runner = this.ds.createQueryRunner();
    await runner.connect();

    const lockKey = `retos-cron-${hoy}`;
    try {
      const [row] = await runner.query('SELECT GET_LOCK(?, 1) AS got, CONNECTION_ID() AS cid', [lockKey]);
      const got = Number(row?.got) === 1;
      if (!got) {
        this.log.warn(`Otro proceso posee el lock, salto ejecución: ${lockKey} (cid=${row?.cid})`);
        return;
      }

      // 👇 Guard por día en BD (sin cambiar esquema):
      // si ya hay asignaciones para HOY, no vuelvo a insertar.
      const [done] = await runner.query(
        `SELECT 1 AS x FROM usuarios_retos WHERE fecha_objetivo = ? LIMIT 1`,
        [hoy],
      );
      if (done) {
        this.log.warn(`Asignaciones para ${hoy} ya existen; no se inserta de nuevo.`);
        // igual marcamos vencidos para no saltarnos esa parte
        await this.retos.marcarVencidos(hoy);
        this.lastRunYmd = hoy;
        return;
      }

      const asignar = await this.retos.asignarAutomaticosSiLaboral(hoy);
      const vencer  = await this.retos.marcarVencidos(hoy);
      this.log.log(`Cron retos @ ${hoy}: asignar=${JSON.stringify(asignar)}; vencer=${JSON.stringify(vencer)}`);
      this.lastRunYmd = hoy;
    } catch (e: any) {
      this.log.error(`Fallo cron ${lockKey}: ${e?.message ?? e}`);
      throw e;
    } finally {
      try {
        const [rel] = await runner.query('SELECT RELEASE_LOCK(?) AS released, CONNECTION_ID() AS cid', [lockKey]);
        this.log.debug(`Release lock ${lockKey}: released=${Number(rel?.released) === 1} (cid=${rel?.cid})`);
      } catch (e) {
        this.log.warn(`No se pudo liberar lock ${lockKey}: ${e}`);
      }
      await runner.release();
    }
  }
}
