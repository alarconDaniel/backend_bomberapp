// src/modules/reto/reto.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import * as dayjs from 'dayjs';

const Holidays = require('date-holidays');

import { Reto } from 'src/models/reto/reto';
import { UsuarioReto } from 'src/models/usuario-reto/usuario-reto';

@Injectable()
export class RetoService {
  private retoRepo: Repository<Reto>;
  private urRepo: Repository<UsuarioReto>;
  private hd: any; // festivos Colombia

  constructor(private readonly ds: DataSource) {
    this.retoRepo = ds.getRepository(Reto);
    this.urRepo = ds.getRepository(UsuarioReto);
    this.hd = new Holidays('CO');
  }

  // --------- Básicos ----------
  public async listarRetos() {
    return this.retoRepo.find();
  }

  public async verReto(cod: number) {
    if (!cod) throw new BadRequestException('Código inválido');
    return this.retoRepo.findOne({ where: { codReto: cod } });
  }

  // --------- Calendario por día ----------
  public async listarPorDia(codUsuario: number, isoYmd: string) {
    const fecha = dayjs(isoYmd, 'YYYY-MM-DD', true);
    if (!fecha.isValid()) throw new BadRequestException('Fecha inválida (YYYY-MM-DD)');
    const ymd = fecha.format('YYYY-MM-DD');

    // Single-day exacto O multi-día (ventana que cubre la fecha)
    const rows = await this.ds.query(
      `
      SELECT
        ur.cod_usuario_reto      AS codUsuarioReto,
        ur.cod_usuario           AS codUsuario,
        ur.cod_reto              AS codReto,
        ur.estado                AS estado,
        ur.fecha_objetivo        AS fechaObjetivo,
        ur.ventana_inicio        AS ventanaInicio,
        ur.ventana_fin           AS ventanaFin,
        r.nombre_reto            AS nombreReto,
        r.descripcion_reto       AS descripcionReto,
        r.tiempo_estimado_seg_reto AS tiempoEstimadoSegReto,
        r.fecha_inicio_reto      AS fechaInicioReto,
        r.fecha_fin_reto         AS fechaFinReto,
        r.es_automatico_reto     AS esAutomaticoReto
      FROM usuarios_retos ur
      JOIN retos r ON r.cod_reto = ur.cod_reto
      WHERE ur.cod_usuario = ?
        AND (
              (ur.fecha_objetivo IS NOT NULL AND ur.fecha_objetivo = ?)
           OR (ur.ventana_inicio IS NOT NULL AND ur.ventana_fin IS NOT NULL
               AND ur.ventana_inicio <= ? AND ur.ventana_fin >= ?)
        )
      ORDER BY r.nombre_reto ASC
      `,
      [codUsuario, ymd, ymd, ymd],
    );

    return rows;
  }

  // --------- Cron ----------
  private isBusinessDay(d: Date): boolean {
    const wd = d.getDay(); // 0 dom, 6 sab
    if (wd === 0 || wd === 6) return false;
    return !this.hd.isHoliday(d);
  }

  /**
   * Asigna para TODOS los operarios (cod_rol=2) los retos plantillas (es_automatico_reto=1)
   * como single-day con fecha_objetivo = hoy. Idempotente con UNIQUE (si lo tienes).
   */
  public async asignarAutomaticosSiLaboral(hoyYmd: string) {
    const hoyDate = new Date(`${hoyYmd}T00:00:00-05:00`);
    if (!this.isBusinessDay(hoyDate)) {
      return { ok: true, asignado: 0, motivo: 'no-laboral' };
    }

    // Usuarios operarios
    const usuarios: Array<{ cod_usuario: number }> = await this.ds.query(
      'SELECT cod_usuario FROM usuarios WHERE cod_rol = 2'
    );

    // Retos automáticos
    const retosAuto: Array<{ cod_reto: number }> = await this.ds.query(
      'SELECT cod_reto FROM retos WHERE es_automatico_reto = 1'
    );

    if (!retosAuto.length || !usuarios.length) {
      return { ok: true, asignado: 0, motivo: 'sin-usuarios-o-retos' };
    }

    const insertSql = `
      INSERT IGNORE INTO usuarios_retos (cod_usuario, cod_reto, fecha_objetivo, estado)
      VALUES (?, ?, ?, 'asignado')
    `;
    let count = 0;
    for (const u of usuarios) {
      for (const r of retosAuto) {
        await this.ds.query(insertSql, [u.cod_usuario, r.cod_reto, hoyYmd]);
        count++;
      }
    }
    return { ok: true, asignado: count };
  }

  /**
   * Vence:
   *  - single-day con fecha_objetivo < hoy,
   *  - multi-día con ventana_fin < hoy,
   * cuando estado ∈ (asignado, en_progreso, abandonado)
   */
  public async marcarVencidos(hoyYmd: string) {
    await this.ds.query(
      `
      UPDATE usuarios_retos
      SET estado = 'vencido', terminado_en = COALESCE(terminado_en, NOW())
      WHERE (
              (fecha_objetivo IS NOT NULL AND fecha_objetivo < ?)
           OR (ventana_fin IS NOT NULL AND ventana_fin < ?)
            )
        AND estado IN ('asignado','en_progreso','abandonado')
      `,
      [hoyYmd, hoyYmd],
    );
    return { ok: true };
  }
}
