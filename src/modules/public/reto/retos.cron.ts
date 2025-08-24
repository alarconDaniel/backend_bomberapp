// src/modules/reto/retos.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { RetoService } from './reto.service';

@Injectable()
export class RetosCron {
  private readonly log = new Logger(RetosCron.name);

  constructor(private readonly retos: RetoService) {}

  @Cron('0 5 0 * * *', { timeZone: 'America/Bogota' })
  async tick() {
    const hoy = dayjs().format('YYYY-MM-DD');
    const asignar = await this.retos.asignarAutomaticosSiLaboral(hoy);
    const vencer = await this.retos.marcarVencidos(hoy);
    this.log.log(
      `Cron retos @ ${hoy}: asignar=${JSON.stringify(asignar)}; vencer=${JSON.stringify(vencer)}`
    );
  }
}
