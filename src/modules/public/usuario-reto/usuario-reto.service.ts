// src/modules/public/usuario-reto/usuario-reto.service.ts
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { UsuarioReto } from 'src/models/usuario-reto/usuario-reto';
import { RespuestaQuiz } from 'src/models/respuestas/respuesta-quiz';
import { RespuestaFormulario } from 'src/models/respuestas/respuesta-form';

type EstadoDB = 'asignado' | 'en_progreso' | 'abandonado' | 'completado' | 'vencido';

@Injectable()
export class UsuarioRetoService {
  private repo: Repository<UsuarioReto>;
  private rqRepo: Repository<RespuestaQuiz>;
  private rfRepo: Repository<RespuestaFormulario>;
  constructor(private readonly ds: DataSource) {
    this.repo = this.ds.getRepository(UsuarioReto);
    this.rqRepo = this.ds.getRepository(RespuestaQuiz);
    this.rfRepo = this.ds.getRepository(RespuestaFormulario);
  }

  // 👇 Helper: trae la instancia activa de HOY para el (usuario, reto)
  private async getInstanciaActivaHoy(codUsuario: number, codReto: number) {
    const [row] = await this.ds.query(
      `
    SELECT ur.*
    FROM usuarios_retos ur
    WHERE ur.cod_usuario = ?
      AND ur.cod_reto   = ?
      AND (
            (ur.fecha_objetivo IS NOT NULL AND ur.fecha_objetivo = CURDATE())
         OR (ur.ventana_inicio IS NOT NULL AND ur.ventana_fin IS NOT NULL
             AND ur.ventana_inicio <= CURDATE() AND ur.ventana_fin >= CURDATE())
      )
      AND ur.estado IN ('asignado','en_progreso')
    ORDER BY ur.cod_usuario_reto DESC
    LIMIT 1
    `,
      [codUsuario, codReto],
    );

    return row ?? null;
  }


  async listarDia(codUsuario: number, fecha?: string) {
    const today = dayjs().format('YYYY-MM-DD');
    const ymd = fecha || today;
    if (dayjs(ymd).isAfter(today)) {
      throw new BadRequestException('No puedes ver días futuros');
    }
    const rows = await this.ds.query(`
    SELECT
      ur.cod_usuario_reto  AS codUsuarioReto,
      ur.cod_usuario       AS codUsuario,
      ur.cod_reto          AS codReto,
      ur.estado            AS estado,
      ur.fecha_objetivo    AS fechaObjetivo,
      ur.ventana_inicio    AS ventanaInicio,
      ur.ventana_fin       AS ventanaFin,
      r.nombre_reto        AS nombreReto,
      r.descripcion_reto   AS descripcionReto,
      r.tiempo_estimado_seg_reto AS tiempoEstimadoSegReto,
      r.fecha_inicio_reto  AS fechaInicioReto,
      r.fecha_fin_reto     AS fechaFinReto,
      r.es_automatico_reto AS esAutomaticoReto,
      r.tipo_reto          AS tipoReto
    FROM usuarios_retos ur
    JOIN retos r ON r.cod_reto = ur.cod_reto
    WHERE ur.cod_usuario = ?
      AND (
            (ur.fecha_objetivo IS NOT NULL AND ur.fecha_objetivo = ?)
         OR (ur.ventana_inicio IS NOT NULL AND ur.ventana_fin IS NOT NULL
             AND ur.ventana_inicio <= ? AND ur.ventana_fin >= ?)
      )
    ORDER BY r.nombre_reto ASC
  `, [codUsuario, ymd, ymd, ymd]);
    return rows;
  }


  async listarMisRetos(codUsuario: number, estado?: 'pendiente' | EstadoDB) {
    const qb = this.repo.createQueryBuilder('ur')
      .innerJoinAndSelect('ur.reto', 'reto')
      .where('ur.codUsuario = :codUsuario', { codUsuario })
      .orderBy('reto.fechaInicioReto', 'ASC');

    if (estado) {
      if (estado === 'pendiente') {
        qb.andWhere('ur.estado IN (:...e)', { e: ['asignado', 'en_progreso'] as EstadoDB[] });
      } else {
        qb.andWhere('ur.estado = :e', { e: estado });
      }
    }
    const rows = await qb.getMany();
    return rows.map(r => ({
      codUsuarioReto: r.codUsuarioReto,
      codReto: r.reto.codReto,
      nombreReto: r.reto.nombreReto,
      descripcionReto: r.reto.descripcionReto,
      tiempoEstimadoSegReto: (r.reto as any).tiempoEstimadoSegReto ?? 0,
      fechaInicioReto: r.reto.fechaInicioReto,
      fechaFinReto: r.reto.fechaFinReto,
      estado: r.estado,
      completado: r.estado === 'completado',
      enProgreso: r.estado === 'en_progreso',
      tipoReto: (r.reto as any).tipoReto ?? 'quiz',
    }));
  }

  async resumenMisRetos(codUsuario: number) {
    const base: Record<EstadoDB, number> = { asignado: 0, en_progreso: 0, abandonado: 0, completado: 0, vencido: 0 };
    const rows = await this.repo.createQueryBuilder('ur')
      .select('ur.estado', 'estado')
      .addSelect('COUNT(*)', 'total')
      .where('ur.codUsuario = :codUsuario', { codUsuario })
      .groupBy('ur.estado')
      .getRawMany<{ estado: EstadoDB; total: string }>();
    for (const r of rows) base[r.estado] = Number(r.total);
    return { ...base, pendiente: base.asignado + base.en_progreso, total: Object.values(base).reduce((a, b) => a + b, 0) };
  }

  async marcarEstado(codUsuario: number, codReto: number, estado: EstadoDB) {
    await this.repo.createQueryBuilder()
      .update(UsuarioReto).set({ estado })
      .where('codUsuario = :codUsuario AND codReto = :codReto', { codUsuario, codReto })
      .execute();
    return { ok: true };
  }

  // === resolución ===
  async abrirReto(codUsuario: number, codReto: number) {
    const ur = await this.getInstanciaActivaHoy(codUsuario, codReto);
    if (!ur) {
      throw new ForbiddenException('No tienes una instancia activa de este reto para hoy.');
    }

    if (ur.estado === 'asignado') {
      await this.repo.createQueryBuilder()
        .update(UsuarioReto)
        .set({ estado: 'en_progreso' as EstadoDB, empezadoEn: () => 'NOW()' as any })
        .where('codUsuarioReto = :id', { id: ur.cod_usuario_reto })
        .execute();
    }

    return { codUsuarioReto: ur.cod_usuario_reto, estado: 'en_progreso' as EstadoDB };
  }


  async responderQuiz(
    codUsuario: number,
    codUsuarioReto: number,
    codPregunta: number,
    valor: any,
    tiempoSeg: number | null
  ) {
    // 1) Cargar UR + reto + ventana vigente HOY y que pertenezca al usuario
    const [ur] = await this.ds.query(
      `
    SELECT ur.*, ur.cod_reto AS codReto
    FROM usuarios_retos ur
    WHERE ur.cod_usuario_reto = ?
      AND ur.cod_usuario = ?
      AND ur.estado IN ('asignado','en_progreso')
      AND (
            (ur.fecha_objetivo IS NOT NULL AND ur.fecha_objetivo = CURDATE())
         OR (ur.ventana_inicio IS NOT NULL AND ur.ventana_fin IS NOT NULL
             AND ur.ventana_inicio <= CURDATE() AND ur.ventana_fin >= CURDATE())
      )
    `,
      [codUsuarioReto, codUsuario],
    );
    if (!ur) throw new ForbiddenException('Instancia de reto no disponible para hoy');

    // 2) Validar que la pregunta pertenece al reto de esa instancia
    const [p] = await this.ds.query(
      `SELECT p.cod_pregunta as codPregunta, p.tipo_pregunta as tipo, p.puntos_pregunta as puntos, p.cod_reto as codReto
     FROM preguntas p WHERE p.cod_pregunta = ?`,
      [codPregunta]
    );
    if (!p) throw new NotFoundException('Pregunta no existe');
    if (Number(p.codReto) !== Number(ur.codReto)) {
      throw new ForbiddenException('La pregunta no corresponde a este reto.');
    }

    // 3) Corrección
    let es_correcta: number | null = null;
    let puntaje: number | null = null;

    if (p.tipo === 'abcd') {
      const correctas = await this.ds.query(
        `SELECT cod_opcion FROM opciones_abcd WHERE cod_pregunta=? AND validez_opcion=1`, [codPregunta]
      );
      const setCorrectas = new Set(correctas.map((r: any) => r.cod_opcion));
      const marcadas: number[] = Array.isArray(valor) ? valor : (valor?.abcd ?? []);
      const ok = marcadas.length > 0 && marcadas.every((id: number) => setCorrectas.has(id)) && marcadas.length === setCorrectas.size;
      es_correcta = ok ? 1 : 0; puntaje = ok ? p.puntos : 0;
    } else if (p.tipo === 'rellenar') {
      const [row] = await this.ds.query(`SELECT respuesta_correcta as rc FROM preguntas_rellenar WHERE cod_pregunta=?`, [codPregunta]);
      const txt = String(valor?.rellenar ?? valor ?? '').trim().toLowerCase();
      const rc = String(row?.rc ?? '').trim().toLowerCase();
      es_correcta = (txt && rc && txt === rc) ? 1 : 0; puntaje = es_correcta ? p.puntos : 0;
    } else if (p.tipo === 'emparejar') {
      const correctas = await this.ds.query(`SELECT cod_item_A as a, cod_item_B as b FROM parejas_correctas WHERE cod_pregunta=?`, [codPregunta]);
      const esperado = new Set(correctas.map((x: any) => `${x.a}-${x.b}`));
      const pares: [number, number][] = valor?.emparejar ?? [];
      const hits = pares.filter(([a, b]) => esperado.has(`${a}-${b}`)).length;
      es_correcta = (hits === esperado.size) ? 1 : 0;
      puntaje = Math.round((hits / Math.max(1, esperado.size)) * p.puntos);
    } else {
      es_correcta = null; puntaje = null;
    }

    await this.rqRepo.save(this.rqRepo.create({
      codUsuarioReto, codPregunta, tiempoSeg, valorJson: valor ?? null,
      esCorrecta: es_correcta, puntaje
    }));

    return { ok: true, esCorrecta: es_correcta, puntaje };
  }


  async enviarFormulario(codUsuario: number, codUsuarioReto: number, codReto: number, data: any) {
    return this.ds.transaction(async (trx) => {
      // 1) Validar instancia activa HOY
      const [ur] = await trx.query(
        `
      SELECT ur.*
      FROM usuarios_retos ur
      WHERE ur.cod_usuario_reto = ?
        AND ur.cod_usuario = ?
        AND ur.cod_reto    = ?
        AND ur.estado IN ('asignado','en_progreso')
        AND (
              (ur.fecha_objetivo IS NOT NULL AND ur.fecha_objetivo = CURDATE())
           OR (ur.ventana_inicio IS NOT NULL AND ur.ventana_fin IS NOT NULL
               AND ur.ventana_inicio <= CURDATE() AND ur.ventana_fin >= CURDATE())
        )
      `,
        [codUsuarioReto, codUsuario, codReto],
      );
      if (!ur) throw new ForbiddenException('No puedes enviar este formulario (fuera de ventana o no asignado).');

      // 2) Upsert del snapshot del form
      const exists = await this.rfRepo.findOne({ where: { codUsuarioReto, codReto } });
      if (exists) {
        exists.data = data;
        exists.terminadoEn = new Date();
        await trx.getRepository(RespuestaFormulario).save(exists);
      } else {
        await trx.getRepository(RespuestaFormulario).save(
          trx.getRepository(RespuestaFormulario).create({ codUsuarioReto, codReto, data, terminadoEn: new Date() }),
        );
      }

      // 3) Completar reto
      await trx
        .createQueryBuilder()
        .update(UsuarioReto)
        .set({
          estado: 'completado' as EstadoDB,
          terminadoEn: () => 'NOW()' as any,
          fechaComplecion: () => 'NOW()' as any,
        })
        .where('codUsuarioReto = :id', { id: codUsuarioReto })
        .execute();

      // 4) Recompensas
      const [{ sumPuntaje }] = await trx.query(
        `SELECT COALESCE(SUM(puntaje),0) AS sumPuntaje
       FROM respuestas_preguntas_usuario WHERE cod_usuario_reto=?`,
        [codUsuarioReto],
      );
      const bonus = 50 + Number(sumPuntaje || 0);
      const coins = Math.round(bonus / 2);

      await trx.query(
        `UPDATE estadisticas_usuarios
       SET xp_estadistica = xp_estadistica + ?, monedas_estadistica = monedas_estadistica + ?
       WHERE cod_usuario = ?`,
        [bonus, coins, codUsuario],
      );

      // 5) 🔥 Racha
      const rachaInfo = await this.actualizarRachaTrasCompletar(trx, codUsuario);

      return { ok: true, completado: true, codUsuarioReto, xpGanada: bonus, coins, ...(rachaInfo.saltado ? {} : { nuevaRacha: rachaInfo.nuevaRacha }) };
    });
  }



  async finalizar(codUsuario: number, codUsuarioReto: number) {
    return this.ds.transaction(async (trx) => {
      // 1) Validar instancia activa HOY
      const [ur] = await trx.query(
        `
      SELECT ur.*
      FROM usuarios_retos ur
      WHERE ur.cod_usuario_reto = ?
        AND ur.cod_usuario = ?
        AND ur.estado IN ('asignado','en_progreso')
        AND (
              (ur.fecha_objetivo IS NOT NULL AND ur.fecha_objetivo = CURDATE())
           OR (ur.ventana_inicio IS NOT NULL AND ur.ventana_fin IS NOT NULL
               AND ur.ventana_inicio <= CURDATE() AND ur.ventana_fin >= CURDATE())
        )
      `,
        [codUsuarioReto, codUsuario],
      );
      if (!ur) throw new ForbiddenException('No puedes finalizar este reto (no activo hoy).');

      // 2) Marcar como completado
      await trx
        .createQueryBuilder()
        .update(UsuarioReto)
        .set({
          estado: 'completado' as EstadoDB,
          terminadoEn: () => 'NOW()' as any,
          fechaComplecion: () => 'NOW()' as any,
        })
        .where('codUsuarioReto = :id', { id: codUsuarioReto })
        .execute();

      // 3) Recompensas
      const [{ sumPuntaje }] = await trx.query(
        `SELECT COALESCE(SUM(puntaje),0) AS sumPuntaje
       FROM respuestas_preguntas_usuario WHERE cod_usuario_reto=?`,
        [codUsuarioReto],
      );
      const bonus = 50 + Number(sumPuntaje || 0);
      const coins = Math.round(bonus / 2);

      await trx.query(
        `UPDATE estadisticas_usuarios
       SET xp_estadistica = xp_estadistica + ?, monedas_estadistica = monedas_estadistica + ?
       WHERE cod_usuario = ?`,
        [bonus, coins, codUsuario],
      );

      // 4) 🔥 Racha
      const rachaInfo = await this.actualizarRachaTrasCompletar(trx, codUsuario);

      return { ok: true, xpGanada: bonus, coins, ...(rachaInfo.saltado ? {} : { nuevaRacha: rachaInfo.nuevaRacha }) };
    });
  }


  // 👇 Añadir dentro de UsuarioRetoService
  private async actualizarRachaTrasCompletar(manager: DataSource | { query: Function }, codUsuario: number) {
    // 1) ¿Cuántos completados tiene HOY este usuario (incluido el que acabamos de marcar)?
    const [{ cnt: completadosHoyStr }] = await (manager as any).query(
      `
    SELECT COUNT(*) AS cnt
    FROM usuarios_retos
    WHERE cod_usuario = ?
      AND estado = 'completado'
      AND DATE(fecha_complecion) = CURDATE()
    `,
      [codUsuario],
    );
    const completadosHoy = Number(completadosHoyStr || 0);

    // Si ya había completado algo hoy (cont > 1), no subimos racha de nuevo
    if (completadosHoy > 1) {
      return { saltado: true };
    }

    // 2) Bloqueamos la fila de estadísticas para lectura/actualización consistente
    const [est] = await (manager as any).query(
      `SELECT racha_estadistica AS racha FROM estadisticas_usuarios WHERE cod_usuario = ? FOR UPDATE`,
      [codUsuario],
    );
    const rachaActual = Number(est?.racha || 0);

    // 3) ¿Hubo completados AYER?
    const [{ lastDay }] = await (manager as any).query(
      `
    SELECT DATE(MAX(fecha_complecion)) AS lastDay
    FROM usuarios_retos
    WHERE cod_usuario = ?
      AND estado = 'completado'
      AND DATE(fecha_complecion) < CURDATE()
    `,
      [codUsuario],
    );
    // Comparamos con AYER en el timezone de MySQL (usa CURDATE())
    const [{ isYesterday }] = await (manager as any).query(
      `
    SELECT (CASE WHEN ? = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) AS isYesterday
    `,
      [lastDay || null],
    );

    const nuevaRacha = isYesterday ? (rachaActual + 1) : 1;

    const [{ mejor }] = await (manager as any).query(
      `SELECT mejor_racha_estadistica AS mejor FROM estadisticas_usuarios WHERE cod_usuario = ? FOR UPDATE`,
      [codUsuario],
    );
    const mejorRacha = Math.max(Number(mejor || 0), nuevaRacha);

    await (manager as any).query(
      `UPDATE estadisticas_usuarios
   SET racha_estadistica = ?, mejor_racha_estadistica = ?, ultima_fecha_racha = CURDATE()
   WHERE cod_usuario = ?`,
      [nuevaRacha, mejorRacha, codUsuario],
    );


    return { saltado: false, nuevaRacha };
  }


}
