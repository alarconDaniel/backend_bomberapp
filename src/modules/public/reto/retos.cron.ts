// src/modules/reto/retos.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { RetoService } from './reto.service';
import { DataSource } from 'typeorm';

@Injectable()
export class RetosCron {
  private readonly log = new Logger(RetosCron.name);

  constructor(
    private readonly retos: RetoService,
    private readonly ds: DataSource,   // 👈 inyecta DataSource
  ) {}

  @Cron('0 5 0 * * *', { timeZone: 'America/Bogota' })
  async tick() {
    // Guard de entorno: permite apagar crons en instancias no “worker”
    if (process.env.ENABLE_CRONS === 'false') {
      this.log.debug('Cron deshabilitado por ENABLE_CRONS=false');
      return;
    }

    const hoy = dayjs().format('YYYY-MM-DD');
    const lockKey = `retos-cron-${hoy}`; // un lock por día

    // intenta tomar el lock (1s de espera)
    const [row] = await this.ds.query('SELECT GET_LOCK(?, 1) AS got', [lockKey]);
    const got = !!row?.got;
    if (!got) {
      this.log.warn(`Otro proceso posee el lock, salto ejecución: ${lockKey}`);
      return;
    }

    try {
      const asignar = await this.retos.asignarAutomaticosSiLaboral(hoy);
      const vencer  = await this.retos.marcarVencidos(hoy);
      this.log.log(
        `Cron retos @ ${hoy}: asignar=${JSON.stringify(asignar)}; vencer=${JSON.stringify(vencer)}`
      );
    } finally {
      await this.ds.query('SELECT RELEASE_LOCK(?)', [lockKey]);
    }
  }
}
