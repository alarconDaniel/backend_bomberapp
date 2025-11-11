// src/modules/estadistica-usuario/racha.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class RachaCron {
  private readonly log = new Logger(RachaCron.name);
  constructor(private readonly ds: DataSource) {}

  // Corre a las 00:05:00 cada día, TZ Bogotá
  @Cron('0 5 0 * * *', { timeZone: 'America/Bogota' })
  async resetSiNoHuboAyer() {
    if (process.env.ENABLE_CRONS === 'false') {
      this.log.debug('Cron deshabilitado por ENABLE_CRONS=false');
      return;
    }

    const [row] = await this.ds.query('SELECT GET_LOCK(?, 1) AS got', [
      `racha-cron-${new Date().toISOString().slice(0, 10)}`,
    ]);
    if (!row?.got) {
      this.log.warn('Otro proceso tiene el lock; salto ejecución de racha');
      return;
    }

    try {
      // Resetea a 0 a quienes NO completaron ayer
      const res = await this.ds.query(`
        UPDATE estadisticas_usuarios eu
        LEFT JOIN (
          SELECT ur.cod_usuario
          FROM usuarios_retos ur
          WHERE ur.estado = 'completado'
            AND DATE(ur.fecha_complecion) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
          GROUP BY ur.cod_usuario
        ) AS c ON c.cod_usuario = eu.cod_usuario
        SET eu.racha_estadistica = 0
        WHERE c.cod_usuario IS NULL
          AND eu.racha_estadistica > 0
      `);

      this.log.log(`Racha reset: ${JSON.stringify(res)}`);

      // (Opcional) Recomputar trofeos de racha ya mismo
      await this.recomputeTrofeosDeRacha();
    } catch (err: any) {
      this.log.error(`Fallo reset racha: ${err?.message}`);
    } finally {
      await this.ds.query('SELECT RELEASE_LOCK(?)', [
        `racha-cron-${new Date().toISOString().slice(0, 10)}`,
      ]);
    }
  }

  // Recalcula SOLO trofeos cuyo nombre incluya "racha"
  private async recomputeTrofeosDeRacha() {
    // Trae trofeos de “racha”
    const trofeos = await this.ds.query(
      `SELECT cod_trofeo, nombre_trofeo FROM trofeos WHERE LOWER(nombre_trofeo) LIKE '%racha%'`
    );
    if (!trofeos?.length) return;

    for (const t of trofeos) {
      try {
        await this.ds.transaction('READ COMMITTED', async (trx) => {
          // Lock del trofeo
          const [locked] = await trx.query(
            `SELECT * FROM trofeos WHERE cod_trofeo = ? FOR UPDATE`,
            [t.cod_trofeo],
          );
          if (!locked) return;

          // Encuentra ganador: mayor racha (desempate por cod_usuario menor)
          const [row] = await trx.query(`
            SELECT eu.cod_usuario AS codUsuario, eu.racha_estadistica AS racha
              FROM estadisticas_usuarios eu
          ORDER BY eu.racha_estadistica DESC, eu.cod_usuario ASC
             LIMIT 1
          `);

          const nextUserId = row?.codUsuario ?? null;
          if (nextUserId === null) return;

          const [prev] = await trx.query(
            `SELECT cod_usuario FROM trofeos WHERE cod_trofeo = ?`,
            [t.cod_trofeo],
          );
          const prevUserId = prev?.cod_usuario ?? null;
          if (prevUserId === nextUserId) return; // sin cambios

          // Actualiza dueño
          await trx.query(
            `UPDATE trofeos SET cod_usuario = ? WHERE cod_trofeo = ?`,
            [nextUserId, t.cod_trofeo],
          );

          // Auditoría
          await trx.query(
            `
            INSERT INTO auditoria_trofeos
              (cod_trofeo, prev_cod_usuario, nuevo_cod_usuario, cambiado_en, motivo_auditoria, metricas_auditoria)
            VALUES
              (?, ?, ?, NOW(), ?, JSON_OBJECT('racha', ?))
            `,
            [
              t.cod_trofeo,
              prevUserId,
              nextUserId,
              'mayor_racha (auto@00:05)',
              row?.racha ?? 0,
            ],
          );
        });
      } catch (e: any) {
        this.log.error(
          `Fallo recompute trofeo racha ${t.cod_trofeo}: ${e?.message}`,
        );
      }
    }
  }
}
