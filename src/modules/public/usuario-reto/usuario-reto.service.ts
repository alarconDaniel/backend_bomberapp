// src/modules/public/usuario-reto/usuario-reto.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import * as dayjs from "dayjs";
import { UsuarioReto } from "src/models/usuario-reto/usuario-reto";
import { RespuestaQuiz } from "src/models/respuestas/respuesta-quiz";
import { RespuestaFormulario } from "src/models/respuestas/respuesta-form";

type EstadoDB =
  | "asignado"
  | "en_progreso"
  | "abandonado"
  | "completado"
  | "vencido";

// ===== Recompensas por defecto para retos NO QUIZ =====
const NON_QUIZ_DEFAULT_XP = 50;
const NON_QUIZ_DEFAULT_COINS = 30;

type RewardResult = { xp: number; coins: number };

// Helper: lee tipo de reto para una instancia UR
async function getTipoRetoForUR(
  ds: DataSource,
  codUsuarioReto: number
): Promise<"quiz" | "form" | "archivo" | null> {
  const [row] = await ds.query(
    `SELECT r.tipo_reto AS tipo
     FROM usuarios_retos ur
     JOIN retos r ON r.cod_reto = ur.cod_reto
     WHERE ur.cod_usuario_reto = ?`,
    [codUsuarioReto]
  );
  const t = String(row?.tipo ?? "").toLowerCase();
  if (!t) return null;
  if (t === "quiz" || t === "form" || t === "archivo") return t;
  return null;
}

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
      [codUsuario, codReto]
    );

    return row ?? null;
  }

  async listarDia(codUsuario: number, fecha?: string) {
    const today = dayjs().format("YYYY-MM-DD");
    const ymd = fecha || today;
    if (dayjs(ymd).isAfter(today)) {
      throw new BadRequestException("No puedes ver días futuros");
    }
    const rows = await this.ds.query(
      `
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
  `,
      [codUsuario, ymd, ymd, ymd]
    );
    return rows;
  }

  async listarMisRetos(codUsuario: number, estado?: "pendiente" | EstadoDB) {
    const qb = this.repo
      .createQueryBuilder("ur")
      .innerJoinAndSelect("ur.reto", "reto")
      .where("ur.codUsuario = :codUsuario", { codUsuario })
      .orderBy("reto.fechaInicioReto", "ASC");

    if (estado) {
      if (estado === "pendiente") {
        qb.andWhere("ur.estado IN (:...e)", {
          e: ["asignado", "en_progreso"] as EstadoDB[],
        });
      } else {
        qb.andWhere("ur.estado = :e", { e: estado });
      }
    }
    const rows = await qb.getMany();
    return rows.map((r) => ({
      codUsuarioReto: r.codUsuarioReto,
      codReto: r.reto.codReto,
      nombreReto: r.reto.nombreReto,
      descripcionReto: r.reto.descripcionReto,
      tiempoEstimadoSegReto: (r.reto as any).tiempoEstimadoSegReto ?? 0,
      fechaInicioReto: r.reto.fechaInicioReto,
      fechaFinReto: r.reto.fechaFinReto,
      estado: r.estado,
      completado: r.estado === "completado",
      enProgreso: r.estado === "en_progreso",
      tipoReto: (r.reto as any).tipoReto ?? "quiz",
    }));
  }

  async resumenMisRetos(codUsuario: number) {
    const base: Record<EstadoDB, number> = {
      asignado: 0,
      en_progreso: 0,
      abandonado: 0,
      completado: 0,
      vencido: 0,
    };
    const rows = await this.repo
      .createQueryBuilder("ur")
      .select("ur.estado", "estado")
      .addSelect("COUNT(*)", "total")
      .where("ur.codUsuario = :codUsuario", { codUsuario })
      .groupBy("ur.estado")
      .getRawMany<{ estado: EstadoDB; total: string }>();
    for (const r of rows) base[r.estado] = Number(r.total);
    return {
      ...base,
      pendiente: base.asignado + base.en_progreso,
      total: Object.values(base).reduce((a, b) => a + b, 0),
    };
  }

  async marcarEstado(codUsuario: number, codReto: number, estado: EstadoDB) {
    await this.repo
      .createQueryBuilder()
      .update(UsuarioReto)
      .set({ estado })
      .where("codUsuario = :codUsuario AND codReto = :codReto", {
        codUsuario,
        codReto,
      })
      .execute();
    return { ok: true };
  }

  async abrirReto(codUsuario: number, codReto: number) {
    const ur = await this.getInstanciaActivaHoy(codUsuario, codReto);
    if (!ur) {
      throw new ForbiddenException(
        "No tienes una instancia activa de este reto para hoy."
      );
    }

    if (ur.estado === "asignado") {
      await this.repo
        .createQueryBuilder()
        .update(UsuarioReto)
        .set({
          estado: "en_progreso" as EstadoDB,
          empezadoEn: () => "NOW()" as any,
        })
        .where("codUsuarioReto = :id", { id: ur.cod_usuario_reto })
        .execute();
    }

    return {
      codUsuarioReto: ur.cod_usuario_reto,
      estado: "en_progreso" as EstadoDB,
    };
  }

  async responderQuiz(
    codUsuario: number,
    codUsuarioReto: number,
    codPregunta: number,
    valor: any,
    tiempoSeg: number | null
  ) {
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
      [codUsuarioReto, codUsuario]
    );
    if (!ur)
      throw new ForbiddenException("Instancia de reto no disponible para hoy");

    const [p] = await this.ds.query(
      `SELECT p.cod_pregunta as codPregunta, p.tipo_pregunta as tipo, p.puntos_pregunta as puntos, p.cod_reto as codReto
     FROM preguntas p WHERE p.cod_pregunta = ?`,
      [codPregunta]
    );
    if (!p) throw new NotFoundException("Pregunta no existe");
    if (Number(p.codReto) !== Number(ur.codReto)) {
      throw new ForbiddenException("La pregunta no corresponde a este reto.");
    }

    let es_correcta_num: 0 | 1 | null = null;
    let puntaje: number | null = null;
    let paresCorrectos: Array<{ a: number; b: number }> | undefined;

    const norm = (s: any) =>
      String(s ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    if (p.tipo === "abcd") {
      const correctas = await this.ds.query(
        `SELECT cod_opcion FROM opciones_abcd WHERE cod_pregunta=? AND validez_opcion=1`,
        [codPregunta]
      );
      const setCorrectas = new Set(
        correctas.map((r: any) => Number(r.cod_opcion))
      );
      const marcadas: number[] = Array.isArray(valor)
        ? valor
        : valor?.abcd ?? [];
      const marcadasNums = (marcadas || [])
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n));
      const ok =
        marcadasNums.length > 0 &&
        marcadasNums.every((id: number) => setCorrectas.has(id)) &&
        marcadasNums.length === setCorrectas.size;
      es_correcta_num = ok ? 1 : 0;
      puntaje = ok ? p.puntos : 0;
    } else if (p.tipo === "rellenar") {
      const [row] = await this.ds.query(
        `SELECT respuesta_correcta as rc FROM preguntas_rellenar WHERE cod_pregunta=?`,
        [codPregunta]
      );
      const txt = norm(valor?.rellenar ?? valor);
      const rc = norm(row?.rc);
      const ok = !!txt && !!rc && txt === rc;
      es_correcta_num = ok ? 1 : 0;
      puntaje = ok ? p.puntos : 0;
    } else if (p.tipo === "emparejar") {
      const correctas = await this.ds.query(
        `SELECT cod_item_A as a, cod_item_B as b FROM parejas_correctas WHERE cod_pregunta=?`,
        [codPregunta]
      );
      const esperado = new Set(
        correctas.map((x: any) => `${Number(x.a)}-${Number(x.b)}`)
      );
      const pares: any[] = valor?.emparejar ?? [];
      const paresNums: Array<[number, number]> = (
        Array.isArray(pares) ? pares : []
      )
        .map((par: any) => {
          const [a, b] = Array.isArray(par) ? par : [null, null];
          const an = Number(a),
            bn = Number(b);
          return [an, bn] as [number, number];
        })
        .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));

      const paresStr = paresNums.map(([a, b]) => `${a}-${b}`);
      const hits = paresStr.filter((s) => esperado.has(s)).length;
      paresCorrectos = paresNums
        .filter(([a, b]) => esperado.has(`${a}-${b}`))
        .map(([a, b]) => ({ a, b }));

      const ok = hits === esperado.size && esperado.size > 0;
      es_correcta_num = ok ? 1 : 0;
      puntaje = ok ? p.puntos : 0;
    } else {
      es_correcta_num = null;
      puntaje = null;
    }

    await this.rqRepo.save(
      this.rqRepo.create({
        codUsuarioReto,
        codPregunta,
        tiempoSeg,
        valorJson: valor ?? null,
        esCorrecta: es_correcta_num,
        puntaje,
      })
    );

    const esCorrectaBool = es_correcta_num === 1;
    return {
      ok: true,
      esCorrecta: esCorrectaBool,
      puntaje,
      ...(paresCorrectos ? { paresCorrectos } : {}),
    };
  }

  async enviarFormulario(
    codUsuario: number,
    codUsuarioReto: number,
    codReto: number,
    data: any
  ) {
    return this.ds.transaction(async (trx) => {
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
        [codUsuarioReto, codUsuario, codReto]
      );
      if (!ur)
        throw new ForbiddenException(
          "No puedes enviar este formulario (fuera de ventana o no asignado)."
        );

      const exists = await this.rfRepo.findOne({
        where: { codUsuarioReto, codReto },
      });
      if (exists) {
        exists.data = data;
        exists.terminadoEn = new Date();
        await trx.getRepository(RespuestaFormulario).save(exists);
      } else {
        await trx.getRepository(RespuestaFormulario).save(
          trx.getRepository(RespuestaFormulario).create({
            codUsuarioReto,
            codReto,
            data,
            terminadoEn: new Date(),
          })
        );
      }

      await trx
        .createQueryBuilder()
        .update(UsuarioReto)
        .set({
          estado: "completado" as EstadoDB,
          terminadoEn: () => "NOW()" as any,
          fechaComplecion: () => "NOW()" as any,
        })
        .where("codUsuarioReto = :id", { id: codUsuarioReto })
        .execute();

      /* ================================
      CÁLCULO DE RECOMPENSAS (centralizado)
      - quiz: por puntaje
      - form/archivo: recompensa fija quemada
      - respeta comodín x2
       ================================ */
      const rewards = await this.calcularYAplicarRecompensas(
        trx,
        codUsuario,
        codUsuarioReto,
        codReto
      );

      const rachaInfo = await this.actualizarRachaTrasCompletar(
        trx,
        codUsuario
      );

      return {
        ok: true,
        completado: true,
        codUsuarioReto,
        xpGanada: rewards.xpGanada,
        coins: rewards.coins,
        ...(rachaInfo.saltado ? {} : { nuevaRacha: rachaInfo.nuevaRacha }),
      };
    });
  }

  async finalizar(codUsuario: number, codUsuarioReto: number) {
    return this.ds.transaction(async (trx) => {
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
        [codUsuarioReto, codUsuario]
      );
      if (!ur)
        throw new ForbiddenException(
          "No puedes finalizar este reto (no activo hoy)."
        );

      await trx
        .createQueryBuilder()
        .update(UsuarioReto)
        .set({
          estado: "completado" as EstadoDB,
          terminadoEn: () => "NOW()" as any,
          fechaComplecion: () => "NOW()" as any,
        })
        .where("codUsuarioReto = :id", { id: codUsuarioReto })
        .execute();

      /* ================================
        CÁLCULO DE RECOMPENSAS (centralizado)
        - quiz: por puntaje
        - form/archivo: recompensa fija quemada
        - respeta comodín x2
      ================================ */
      const rewards = await this.calcularYAplicarRecompensas(
        trx,
        codUsuario,
        codUsuarioReto,
        ur?.cod_reto ?? null
      );

      const rachaInfo = await this.actualizarRachaTrasCompletar(
        trx,
        codUsuario
      );

      return {
        ok: true,
        xpGanada: rewards.xpGanada,
        coins: rewards.coins,
        ...(rachaInfo.saltado ? {} : { nuevaRacha: rachaInfo.nuevaRacha }),
      };
    });
  }

  async usarComodin(
    codUsuario: number,
    codUsuarioReto: number,
    body: {
      codPregunta: number | null;
      tipo: "50/50" | "mas_tiempo" | "protector_racha" | "double" | "ave_fenix";
      segundos?: number;
      hasta?: string;
    }
  ) {
    const tipo = this.normalizarTipo(body.tipo as any);

    const [ur] = await this.ds.query(
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
      LIMIT 1
      `,
      [codUsuarioReto, codUsuario]
    );
    if (!ur)
      throw new ForbiddenException(
        "No puedes usar comodines en esta instancia."
      );

    if (tipo === "double") {
      const [{ cnt }] = await this.ds.query(
        `SELECT COUNT(*) AS cnt FROM usos_comodines WHERE cod_usuario_reto = ? AND tipo='double'`,
        [codUsuarioReto]
      );
      if (Number(cnt || 0) > 0) {
        throw new BadRequestException(
          "El comodín x2 ya fue usado en este quiz."
        );
      }
    }

    return await this.ds.transaction(async (trx) => {
      const patterns = this.aliasPatterns(tipo);
      let invRow: any = null;

      for (const pat of patterns) {
        const [row] = await trx.query(
          `
  SELECT ii.cod_item_inventario AS codInv,
         ii.cantidad_item,
         it.cod_item AS codItem,
         it.nombre_item AS nombre,
         it.tipo_item AS tipo
  FROM items_inventario ii
  JOIN items_tienda it ON it.cod_item = ii.cod_item
  WHERE ii.cod_usuario = ?
    AND UPPER(it.tipo_item) = 'POTENCIADOR'
    AND LOWER(it.nombre_item) LIKE ?
    AND ii.cantidad_item > 0
  ORDER BY ii.cantidad_item DESC
  LIMIT 1
  FOR UPDATE
  `,
          [codUsuario, pat]
        );
        if (row && Number(row.cantidad_item) > 0) {
          invRow = row;
          break;
        }
      }

      if (!invRow) {
        throw new BadRequestException(
          "No tienes este comodín en tu inventario."
        );
      }

      await trx.query(
        `UPDATE items_inventario SET cantidad_item = cantidad_item - 1 WHERE cod_item_inventario = ? AND cantidad_item > 0`,
        [invRow.codInv]
      );

      const payload: any = {};
      if (body.segundos != null)
        payload.segundos = Math.max(1, Math.floor(Number(body.segundos) || 0));
      if (body.hasta) payload.hasta = String(body.hasta);

      await trx.query(
        `INSERT INTO usos_comodines (cod_usuario_reto, cod_usuario, tipo, payload)
         VALUES (?, ?, ?, ?)`,
        [
          codUsuarioReto,
          codUsuario,
          tipo,
          Object.keys(payload).length ? JSON.stringify(payload) : null,
        ]
      );

      return {
        ok: true,
        codUsuarioReto,
        usado: { tipo, codPregunta: body.codPregunta ?? null },
        inventario: {
          codItemInventario: invRow.codInv,
          restante: Math.max(0, Number(invRow.cantidad_item) - 1),
        },
      };
    });
  }

  private normalizarTipo(
    input: string
  ): "50/50" | "mas_tiempo" | "protector_racha" | "double" | "ave_fenix" {
    const s = String(input || "")
      .trim()
      .toLowerCase();
    if (
      [
        "50/50",
        "5050",
        "fifty",
        "fifty-fifty",
        "fifty_fifty",
        "cincuenta",
        "cincuenta-cincuenta",
      ].includes(s)
    )
      return "50/50";
    if (
      [
        "mas_tiempo",
        "más_tiempo",
        "mas-tiempo",
        "tiempo_extra",
        "tiempo",
        "extra",
        "+5s",
        "+15s",
        "mas tiempo",
        "más tiempo",
      ].includes(s)
    )
      return "mas_tiempo";
    if (
      [
        "protector_racha",
        "escudo_racha",
        "escudo",
        "racha",
        "shield",
        "streak_shield",
      ].includes(s)
    )
      return "protector_racha";
    if (["double", "x2", "doble", "2x"].includes(s)) return "double";
    if (["ave_fenix", "fenix", "fénix", "phoenix"].includes(s))
      return "ave_fenix";
    throw new BadRequestException("Tipo de comodín no válido");
  }

  private aliasPatterns(
    tipo: "50/50" | "mas_tiempo" | "protector_racha" | "double" | "ave_fenix"
  ): string[] {
    switch (tipo) {
      case "50/50":
        return ["%50/50%", "%fifty%"].map((s) => s.toLowerCase());
      case "mas_tiempo":
        return ["%15s%", "%tiempo%", "%extra%", "%+15%"].map((s) =>
          s.toLowerCase()
        );
      case "protector_racha":
        return ["%racha%", "%shield%", "%escudo%"].map((s) => s.toLowerCase());
      case "double":
        return ["%x2%", "%doble%", "%double%"].map((s) => s.toLowerCase());
      case "ave_fenix":
        return ["%fenix%", "%fénix%", "%phoenix%"].map((s) => s.toLowerCase());
      default:
        return ["%"];
    }
  }

  private async actualizarRachaTrasCompletar(
    manager: DataSource | { query: Function },
    codUsuario: number
  ) {
    const [{ cnt: completadosHoyStr }] = await (manager as any).query(
      `
    SELECT COUNT(*) AS cnt
    FROM usuarios_retos
    WHERE cod_usuario = ?
      AND estado = 'completado'
      AND DATE(fecha_complecion) = CURDATE()
    `,
      [codUsuario]
    );
    const completadosHoy = Number(completadosHoyStr || 0);

    if (completadosHoy > 1) {
      return { saltado: true };
    }

    const [est] = await (manager as any).query(
      `SELECT racha_estadistica AS racha FROM estadisticas_usuarios WHERE cod_usuario = ? FOR UPDATE`,
      [codUsuario]
    );
    const rachaActual = Number(est?.racha || 0);

    const [{ lastDay }] = await (manager as any).query(
      `
    SELECT DATE(MAX(fecha_complecion)) AS lastDay
    FROM usuarios_retos
    WHERE cod_usuario = ?
      AND estado = 'completado'
      AND DATE(fecha_complecion) < CURDATE()
    `,
      [codUsuario]
    );
    const [{ isYesterday }] = await (manager as any).query(
      `
    SELECT (CASE WHEN ? = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) AS isYesterday
    `,
      [lastDay || null]
    );

    const nuevaRacha = isYesterday ? rachaActual + 1 : 1;

    const [{ mejor }] = await (manager as any).query(
      `SELECT mejor_racha_estadistica AS mejor FROM estadisticas_usuarios WHERE cod_usuario = ? FOR UPDATE`,
      [codUsuario]
    );
    const mejorRacha = Math.max(Number(mejor || 0), nuevaRacha);

    await (manager as any).query(
      `UPDATE estadisticas_usuarios
   SET racha_estadistica = ?, mejor_racha_estadistica = ?, ultima_fecha_racha = CURDATE()
   WHERE cod_usuario = ?`,
      [nuevaRacha, mejorRacha, codUsuario]
    );

    return { saltado: false, nuevaRacha };
  }

  private async calcularYAplicarRecompensas(
    trx: DataSource | { query: Function },
    codUsuario: number,
    codUsuarioReto: number,
    codReto?: number | null
  ): Promise<{ xpGanada: number; coins: number }> {
    // 1) Determinar el tipo del reto
    const tipo = await getTipoRetoForUR(this.ds, codUsuarioReto);

    // 2) Calcular base según tipo
    let baseXp = 0;
    let baseCoins = 0;

    if (tipo === "quiz") {
      const [{ sumPuntaje }] = await (trx as any).query(
        `SELECT COALESCE(SUM(puntaje),0) AS sumPuntaje
       FROM respuestas_preguntas_usuario WHERE cod_usuario_reto=?`,
        [codUsuarioReto]
      );
      baseXp = Number(sumPuntaje || 0);
      baseCoins = baseXp; // tu lógica actual
    } else {
      // form | archivo → recompensa "quemada"
      baseXp = NON_QUIZ_DEFAULT_XP;
      baseCoins = NON_QUIZ_DEFAULT_COINS;
    }

    // 3) ¿Se usó comodín x2 en esta instancia? → duplica
    const [{ usedX2 }] = await (trx as any).query(
      `SELECT COUNT(*) AS usedX2 FROM usos_comodines WHERE cod_usuario_reto=? AND tipo='double'`,
      [codUsuarioReto]
    );
    if (Number(usedX2 || 0) > 0) {
      baseXp *= 2;
      baseCoins *= 2;
    }

    // 4) Aplicar a estadísticas del usuario
    await (trx as any).query(
      `UPDATE estadisticas_usuarios
     SET xp_estadistica = xp_estadistica + ?, monedas_estadistica = monedas_estadistica + ?
     WHERE cod_usuario = ?`,
      [baseXp, baseCoins, codUsuario]
    );

    return { xpGanada: baseXp, coins: baseCoins };
  }

  async preguntasDeUsuarioReto(codUsuario: number, codUsuarioReto: number) {
    const [ur] = await this.ds.query(
      `SELECT ur.cod_usuario_reto, ur.cod_usuario, ur.cod_reto
       FROM usuarios_retos ur
       WHERE ur.cod_usuario_reto=? AND ur.cod_usuario=?`,
      [codUsuarioReto, codUsuario]
    );
    if (!ur) throw new ForbiddenException("No tienes acceso a este reto.");

    const preguntas = await this.ds.query(
      `SELECT p.cod_pregunta   AS codPregunta,
              p.numero_pregunta AS numero,
              p.enunciado_pregunta AS enunciado,
              p.tipo_pregunta   AS tipo,
              p.tiempo_max_pregunta AS tiempoMax,
              p.puntos_pregunta AS puntos
       FROM preguntas p
       WHERE p.cod_reto = ?
       ORDER BY p.numero_pregunta ASC`,
      [ur.cod_reto]
    );

    for (const q of preguntas) {
      if (q.tipo === "abcd") {
        const ops = await this.ds.query(
          `SELECT cod_opcion AS codOpcion,
                  texto_opcion AS texto,
                  validez_opcion AS correcta
           FROM opciones_abcd
           WHERE cod_pregunta=? 
           ORDER BY cod_opcion ASC`,
          [q.codPregunta]
        );
        q.opciones = ops;
      } else if (q.tipo === "emparejar") {
        const items = await this.ds.query(
          `SELECT cod_item AS codItem, lado, contenido
           FROM items_emparejamiento
           WHERE cod_pregunta=?
           ORDER BY cod_item ASC`,
          [q.codPregunta]
        );
        const A = items
          .filter((r: any) => r.lado === "A")
          .map((r: any) => ({ codItem: r.codItem, contenido: r.contenido }));
        const B = items
          .filter((r: any) => r.lado === "B")
          .map((r: any) => ({ codItem: r.codItem, contenido: r.contenido }));
        q.emparejar = { A, B };
      }
    }

    return preguntas;
  }
}
