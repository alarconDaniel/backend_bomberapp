// src/modules/estadistica-usuario/racha.cron.ts
// Tarea programada para manejar la racha diaria y reasignar trofeos relacionados.
// Se apoya en locks de BD para evitar que múltiples instancias corran el mismo proceso a la vez.
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class RachaCron {
  private readonly log = new Logger(RachaCron.name);

  constructor(private readonly ds: DataSource) {}

  // Corre a las 00:05:00 cada día (hora Bogotá) y resetea la racha
  // de quienes no completaron ningún reto el día anterior.
  @Cron('0 5 0 * * *', { timeZone: 'America/Bogota' })
  async resetSiNoHuboAyer() {
    if (process.env.ENABLE_CRONS === 'false') {
      this.log.debug('Cron deshabilitado por ENABLE_CRONS=false');
      return;
    }

    // Lock distribuido en BD para evitar ejecución concurrente en varias réplicas.
    const [row] = await this.ds.query('SELECT GET_LOCK(?, 1) AS got', [
      `racha-cron-${new Date().toISOString().slice(0, 10)}`,
    ]);
    if (!row?.got) {
      this.log.warn('Otro proceso tiene el lock; salto ejecución de racha');
      return;
    }

    try {
      // Resetea racha a 0 solo a quienes NO completaron ningún reto ayer,
      // conservando la racha de los que sí cumplieron.
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

      // Tras el reseteo, se recalculan los trofeos vinculados a racha.
      await this.recomputeTrofeosDeRacha();
    } catch (err: any) {
      this.log.error(`Fallo reset racha: ${err?.message}`);
    } finally {
      // Libera el lock para permitir la próxima ejecución.
      await this.ds.query('SELECT RELEASE_LOCK(?)', [
        `racha-cron-${new Date().toISOString().slice(0, 10)}`,
      ]);
    }
  }

  // Recalcula SOLO trofeos cuyo nombre incluya "racha"
  private async recomputeTrofeosDeRacha() {
    // Selecciona únicamente trofeos de “racha” por convención de nombre.
    const trofeos = await this.ds.query(
      `SELECT cod_trofeo, nombre_trofeo FROM trofeos WHERE LOWER(nombre_trofeo) LIKE '%racha%'`
    );
    if (!trofeos?.length) return;

    for (const t of trofeos) {
      try {
        await this.ds.transaction('READ COMMITTED', async (trx) => {
          // Lock del trofeo específico para evitar condiciones de carrera en su reasignación.
          const [locked] = await trx.query(
            `SELECT * FROM trofeos WHERE cod_trofeo = ? FOR UPDATE`,
            [t.cod_trofeo],
          );
          if (!locked) return;

          // Busca el usuario con mayor racha (desempate por cod_usuario menor).
          const [row] = await trx.query(`
            SELECT eu.cod_usuario AS codUsuario, eu.racha_estadistica AS racha
              FROM estadisticas_usuarios eu
          ORDER BY eu.racha_estadistica DESC, eu.cod_usuario ASC
             LIMIT 1
          `);

          const nextUserId = row?.codUsuario ?? null;
          if (nextUserId === null) return;

          // Consulta del dueño actual para saber si realmente hay cambio.
          const [prev] = await trx.query(
            `SELECT cod_usuario FROM trofeos WHERE cod_trofeo = ?`,
            [t.cod_trofeo],
          );
          const prevUserId = prev?.cod_usuario ?? null;
          if (prevUserId === nextUserId) return; // sin cambios, se evita escritura innecesaria

          // Actualiza el dueño del trofeo al nuevo líder de racha.
          await trx.query(
            `UPDATE trofeos SET cod_usuario = ? WHERE cod_trofeo = ?`,
            [nextUserId, t.cod_trofeo],
          );

          // Registra en la tabla de auditoría la reasignación del trofeo.
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
