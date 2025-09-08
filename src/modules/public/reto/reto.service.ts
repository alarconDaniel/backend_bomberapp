import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Reto } from "src/models/reto/reto";
import { UsuarioReto } from "src/models/usuario-reto/usuario-reto";
import * as dayjs from "dayjs";
const Holidays = require("date-holidays");

type RetoDTO = {
  codReto: number;
  nombreReto: string;
  descripcionReto: string | null;
  tiempoEstimadoSegReto: number | null;
  fechaInicioReto: string | null;
  fechaFinReto: string | null;
};

type ProgresoDiaItem = {
  codReto: number;
  titulo: string;
  completados: number;
  total: number;
  pct: number;
  tipo: "quiz" | "form" | "archivo";
  icon: string;
  mi?: { asignado: boolean; completado: boolean; enProgreso: boolean };
};

@Injectable()
export class RetoService {
  private retoRepo: Repository<Reto>;
  private urRepo: Repository<UsuarioReto>;
  private hd: any; // festivos CO

  // compatibilidad
  public readonly repo: Repository<Reto>;

  constructor(public readonly ds: DataSource) {
    this.retoRepo = ds.getRepository(Reto);
    this.repo = ds.getRepository(Reto);
    this.urRepo = ds.getRepository<UsuarioReto>(UsuarioReto);
    this.hd = new Holidays("CO");
  }

  // --------- Básicos ----------
  public async listarRetos() {
    return this.retoRepo.find();
  }

  public async verReto(cod: number) {
    if (!cod) throw new BadRequestException("Código inválido");
    return this.retoRepo.findOne({ where: { codReto: cod } });
  }

  // --------- Calendario por día (asignaciones del usuario) ----------
  public async listarPorDia(codUsuario: number, isoYmd: string) {
    const fecha = dayjs(isoYmd, "YYYY-MM-DD", true);
    if (!fecha.isValid())
      throw new BadRequestException("Fecha inválida (YYYY-MM-DD)");
    const ymd = fecha.format("YYYY-MM-DD");

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
        r.tipo_reto          AS tipoReto,
        r.metadata_reto      AS metadataReto
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

    return rows.map((r: any) => ({
      ...r,
      icono: pickIcon(
        String(r?.tipoReto ?? ""),
        safeParseJson(r?.metadataReto)
      ),
    }));
  }

  /**
   * Agregado por día (HomeScreen) — devuelve TODOS los retos activos cuyo rango cubre la fecha,
   * aunque no haya filas en usuarios_retos. Une con agregados de asignaciones si existen.
   */
  public async progresoDia(
    isoYmd: string,
    codUsuario?: number
  ): Promise<ProgresoDiaItem[]> {
    const fecha = dayjs(isoYmd, "YYYY-MM-DD", true);
    if (!fecha.isValid())
      throw new BadRequestException("Fecha inválida (YYYY-MM-DD)");
    const ymd = fecha.format("YYYY-MM-DD");
    const uid = Number.isFinite(codUsuario as any) ? Number(codUsuario) : -1;

    const rows = await this.ds.query(
      `
      SELECT
        r.cod_reto       AS codReto,
        r.nombre_reto    AS titulo,
        r.tipo_reto      AS tipoReto,
        r.metadata_reto  AS metadataReto,
        COALESCE(agg.total, 0)         AS total,
        COALESCE(agg.completados, 0)   AS completados,
        COALESCE(agg.me_asignado, 0)   AS me_asignado,
        COALESCE(agg.me_completado, 0) AS me_completado,
        COALESCE(agg.me_en_progreso, 0) AS me_en_progreso
      FROM retos r
      LEFT JOIN (
        SELECT
          ur.cod_reto,
          SUM(CASE WHEN ur.estado = 'completado' THEN 1 ELSE 0 END) AS completados,
          COUNT(*) AS total,
          MAX(CASE WHEN ur.cod_usuario = ? THEN 1 ELSE 0 END) AS me_asignado,
          MAX(CASE WHEN ur.cod_usuario = ? AND ur.estado = 'completado' THEN 1 ELSE 0 END) AS me_completado,
          MAX(CASE WHEN ur.cod_usuario = ? AND ur.estado = 'en_progreso' THEN 1 ELSE 0 END) AS me_en_progreso
        FROM usuarios_retos ur
        WHERE
          (
            (ur.fecha_objetivo IS NOT NULL AND ur.fecha_objetivo = ?)
            OR (ur.ventana_inicio IS NOT NULL AND ur.ventana_fin IS NOT NULL
                AND ur.ventana_inicio <= ? AND ur.ventana_fin >= ?)
          )
        GROUP BY ur.cod_reto
      ) agg ON agg.cod_reto = r.cod_reto
      WHERE
        r.activo = 1
        AND r.fecha_inicio_reto <= ?
        AND r.fecha_fin_reto   >= ?
      ORDER BY r.nombre_reto ASC
      `,
      [uid, uid, uid, ymd, ymd, ymd, ymd, ymd]
    );

    return rows.map((r: any) => {
      const total = Number(r.total ?? 0);
      const comp = Number(r.completados ?? 0);
      const pct = total > 0 ? Math.round((comp / total) * 100) : 0;
      const tipo = String(r?.tipoReto ?? "form").toLowerCase() as
        | "quiz"
        | "form"
        | "archivo";
      const meta = safeParseJson(r?.metadataReto);
      return {
        codReto: Number(r.codReto),
        titulo: String(r.titulo ?? ""),
        completados: comp,
        total,
        pct,
        tipo,
        icon: pickIcon(tipo, meta),
        mi: {
          asignado: !!r.me_asignado,
          completado: !!r.me_completado,
          enProgreso: !!r.me_en_progreso,
        },
      };
    });
  }

  // --------- Cron ----------
  private isBusinessDay(d: Date): boolean {
    const wd = d.getDay(); // 0 dom, 6 sab
    if (wd === 0) return false;
    return !this.hd.isHoliday(d);
  }

  /** Asigna retos automáticos por cargo si el día es laboral. */
  public async asignarAutomaticosSiLaboral(hoyYmd: string) {
    const hoyDate = new Date(`${hoyYmd}T00:00:00-05:00`);
    if (!this.isBusinessDay(hoyDate)) {
      return {
        ok: true,
        intentadas: 0,
        nuevas: 0,
        motivo: "no-laboral",
        fecha: hoyYmd,
      };
    }

    const sql = `
      INSERT IGNORE INTO usuarios_retos (cod_usuario, cod_reto, fecha_objetivo, estado)
      SELECT
        u.cod_usuario,
        r.cod_reto,
        ? AS fecha_objetivo,
        'asignado' AS estado
      FROM usuarios u
      JOIN cargos_retos cr ON cr.cod_cargo_usuario = u.cod_cargo_usuario
      JOIN retos r          ON r.cod_reto = cr.cod_reto
      WHERE u.cod_rol = 2
        AND r.es_automatico_reto = 1
        AND r.activo = 1
        AND r.fecha_inicio_reto <= ?
        AND r.fecha_fin_reto   >= ?
    `;
    const res: any = await this.ds.query(sql, [hoyYmd, hoyYmd, hoyYmd]);
    const nuevas = Number(res?.affectedRows ?? 0);
    return { ok: true, intentadas: nuevas, nuevas, fecha: hoyYmd };
  }

  /** Marca vencidos según fecha. */
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
      [hoyYmd, hoyYmd]
    );
    return { ok: true };
  }

  private toDTO = (r: Partial<Reto>): RetoDTO => ({
    codReto: r.codReto!,
    nombreReto: r.nombreReto!,
    descripcionReto: (r as any).descripcionReto ?? null,
    tiempoEstimadoSegReto: (r as any).tiempoEstimadoSegReto ?? null,
    fechaInicioReto: (r as any).fechaInicioReto ?? null,
    fechaFinReto: (r as any).fechaFinReto ?? null,
  });

  /** Devuelve el reto con estructura completa (quiz/form/archivo). */
  public async verRetoFull(codReto: number) {
    const r = await this.retoRepo.findOne({ where: { codReto } });
    if (!r) throw new NotFoundException("Reto no encontrado");

    if (r.tipoReto === "quiz") {
      const preguntas = await this.ds.query(
        `
      SELECT p.cod_pregunta as codPregunta, p.numero_pregunta as numero,
             p.enunciado_pregunta as enunciado, p.tipo_pregunta as tipo,
             p.puntos_pregunta as puntos, p.tiempo_max_pregunta as tiempoMax
      FROM preguntas p
      WHERE p.cod_reto = ? AND p.numero_pregunta > 0
      ORDER BY p.numero_pregunta ASC
      `,
        [codReto]
      );

      for (const q of preguntas) {
        if (q.tipo === "abcd") {
          q.opciones = await this.ds.query(
            `SELECT cod_opcion as codOpcion, texto_opcion as texto, validez_opcion as correcta
           FROM opciones_abcd WHERE cod_pregunta=? ORDER BY cod_opcion ASC`,
            [q.codPregunta]
          );
        }
        if (q.tipo === "rellenar") {
          const [row] = await this.ds.query(
            `SELECT respuesta_correcta as correcta FROM preguntas_rellenar WHERE cod_pregunta=?`,
            [q.codPregunta]
          );
          q.correcta = row?.correcta ?? null;
        }
        if (q.tipo === "emparejar") {
          q.items = await this.ds.query(
            `SELECT cod_item as codItem, lado, contenido FROM items_emparejamiento WHERE cod_pregunta=? ORDER BY cod_item ASC`,
            [q.codPregunta]
          );
          q.parejas = await this.ds.query(
            `SELECT cod_item_A as a, cod_item_B as b FROM parejas_correctas WHERE cod_pregunta=?`,
            [q.codPregunta]
          );
        }
        // tipo 'reporte': no hay tabla hija que consultar en tu esquema → nada adicional
      }
      return { ...r, quiz: { preguntas } };
    } else {
      // 'form' o 'archivo' → metadata opcional
      return { ...r, form: r.metadataReto?.schema ?? null };
    }
  }

  // ---------- LISTAR ----------
  public async listar(): Promise<RetoDTO[]> {
    const rows = await this.retoRepo.find({
      loadEagerRelations: false,
      relations: {},
      select: {
        codReto: true,
        nombreReto: true,
        descripcionReto: true,
        tiempoEstimadoSegReto: true,
        fechaInicioReto: true,
        fechaFinReto: true,
      },
      order: { codReto: "ASC" },
    });
    return rows.map(this.toDTO);
  }

  // ---------- DETALLE ----------
  public async detalle(codReto: number): Promise<RetoDTO> {
    const reto = await this.retoRepo.findOne({
      where: { codReto },
      loadEagerRelations: false,
      relations: {},
      select: {
        codReto: true,
        nombreReto: true,
        descripcionReto: true,
        tiempoEstimadoSegReto: true,
        fechaInicioReto: true,
        fechaFinReto: true,
      },
    });
    if (!reto) throw new NotFoundException("Reto no encontrado");
    return this.toDTO(reto);
  }

  // ---------- CREAR (genérico) ----------
  public async crear(payload: Partial<Reto>): Promise<RetoDTO | any> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // Si es QUIZ con preguntas → delega a crearQuiz (que ya está transaccional)
      const tipoMaybe =
        (payload as any)?.tipoReto ??
        (payload as any)?.tipo ??
        (payload as any)?.tipo_reto;
      const tipo = tipoMaybe
        ? String(tipoMaybe).toLowerCase().trim()
        : undefined;
      const preguntas = (payload as any)?.preguntas;
      if (tipo === "quiz" && Array.isArray(preguntas) && preguntas.length > 0) {
        await qr.release(); // usamos el flujo existente
        return this.crearQuiz(payload as any);
      }

      const clean = { ...(payload as any) };
      if ("codReto" in clean) delete clean.codReto;

      // Nombre
      clean.nombreReto = (clean.nombreReto ?? "").toString().trim();
      if (!clean.nombreReto) {
        throw new HttpException(
          "nombreReto es requerido",
          HttpStatus.BAD_REQUEST
        );
      }

      if (clean.descripcionReto === undefined) clean.descripcionReto = null;

      // metadata/config
      const rawConfig =
        (payload as any)?.config ??
        (payload as any)?.metadataReto ??
        (payload as any)?.metadata_reto;
      if (rawConfig !== undefined) {
        try {
          clean.metadataReto =
            typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;
        } catch {
          clean.metadataReto = null;
        }
      } else {
        if (clean.metadataReto === undefined) clean.metadataReto = null;
      }

      // Tiempo estimado
      if (clean.tiempoEstimadoSegReto != null) {
        clean.tiempoEstimadoSegReto = Math.max(
          0,
          Math.trunc(Number(clean.tiempoEstimadoSegReto))
        );
        if (Number.isNaN(clean.tiempoEstimadoSegReto)) {
          throw new HttpException(
            "tiempoEstimadoSegReto inválido",
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // Flags
      clean.esAutomaticoReto = Number(
        (payload as any)?.esAutomaticoReto ??
          (payload as any)?.es_automatico_reto ??
          clean.esAutomaticoReto
      )
        ? 1
        : 0;
      clean.activo = Number((payload as any)?.activo ?? clean.activo) ? 1 : 0;

      // Tipo
      let tipoReto: string | undefined =
        (payload as any)?.tipoReto ?? (payload as any)?.tipo ?? clean.tipoReto;
      tipoReto = tipoReto ? String(tipoReto).toLowerCase().trim() : undefined;
      if (
        !tipoReto &&
        clean.metadataReto &&
        typeof clean.metadataReto === "object"
      ) {
        const kind = String(clean.metadataReto.kind ?? "").toLowerCase();
        if (["quiz", "form", "archivo"].includes(kind)) tipoReto = kind;
      }
      if (!tipoReto) {
        throw new HttpException(
          "tipoReto es requerido (quiz|form|archivo)",
          HttpStatus.BAD_REQUEST
        );
      }
      if (!["quiz", "form", "archivo"].includes(tipoReto)) {
        throw new HttpException(
          'tipoReto inválido (usa "quiz", "form" o "archivo")',
          HttpStatus.BAD_REQUEST
        );
      }
      clean.tipoReto = tipoReto;

      // Fechas
      if (clean.fechaInicioReto !== undefined)
        clean.fechaInicioReto = toMySqlDateOrNull(clean.fechaInicioReto);
      if (clean.fechaFinReto !== undefined)
        clean.fechaFinReto = toMySqlDateOrNull(clean.fechaFinReto);
      const iniCheck = clean.fechaInicioReto;
      const finCheck = clean.fechaFinReto;
      if (iniCheck && finCheck) {
        if (
          dayjs(finCheck, "YYYY-MM-DD", true).isBefore(
            dayjs(iniCheck, "YYYY-MM-DD", true)
          )
        ) {
          throw new HttpException(
            "fechaFinReto no puede ser anterior a fechaInicioReto",
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // ================= INSERT reto =================
      const res = await qr.manager.query(
        `INSERT INTO retos
       (nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
        fecha_inicio_reto, fecha_fin_reto,
        es_automatico_reto, tipo_reto, metadata_reto, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clean.nombreReto,
          clean.descripcionReto,
          clean.tiempoEstimadoSegReto ?? null,
          clean.fechaInicioReto,
          clean.fechaFinReto,
          clean.esAutomaticoReto,
          clean.tipoReto,
          clean.metadataReto ? JSON.stringify(clean.metadataReto) : null,
          clean.activo,
        ]
      );
      const codReto = Number(res?.insertId);
      if (!codReto)
        throw new HttpException(
          "No se pudo crear el reto",
          HttpStatus.BAD_REQUEST
        );

      // ================= CARGOS (opcional) =================
      // Espera cualquiera de: cargoIds | cargos | cargosIds en payload
      const cargoIds: number[] =
        (payload as any)?.cargoIds ??
        (payload as any)?.cargos ??
        (payload as any)?.cargosIds ??
        [];
      if (Array.isArray(cargoIds)) {
        await this.replaceCargosForReto(qr, codReto, cargoIds);
      }

      await qr.commitTransaction();

      const fresh = await this.retoRepo.findOne({
        where: { codReto },
        select: {
          codReto: true,
          nombreReto: true,
          descripcionReto: true,
          tiempoEstimadoSegReto: true,
          fechaInicioReto: true,
          fechaFinReto: true,
        },
      });
      return this.toDTO(fresh!);
    } catch (e: any) {
      try {
        await qr.rollbackTransaction();
      } catch {}
      console.error("[RETOS][crear] FAIL =>", e);
      if (e instanceof HttpException) throw e;
      if (e?.code === "ER_DUP_ENTRY" || e?.errno === 1062) {
        throw new HttpException("Reto duplicado", HttpStatus.BAD_REQUEST);
      }
      if (e?.errno === 1366) {
        throw new HttpException(
          "Valor inválido (enum/num)",
          HttpStatus.BAD_REQUEST
        );
      }
      if (e?.errno === 1292) {
        throw new HttpException("Fecha inválida", HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        "No se pudo crear el reto",
        HttpStatus.BAD_REQUEST
      );
    } finally {
      try {
        await qr.release();
      } catch {}
    }
  }

  // ---------- BORRAR ----------
  public async borrar(codReto: number): Promise<{ ok: true }> {
    const r = await this.retoRepo.delete({ codReto });
    if (!r.affected) throw new NotFoundException("Reto no encontrado");
    return { ok: true };
  }

  // ---------- MODIFICAR (tu lógica original) ----------
  public async modificar(
    codReto: number,
    payload: Partial<Reto>
  ): Promise<RetoDTO> {
    const id = Number(codReto);
    if (!Number.isFinite(id) || id <= 0)
      throw new BadRequestException("codReto inválido");

    const current = await this.retoRepo.findOne({ where: { codReto: id } });
    if (!current) throw new NotFoundException("Reto no encontrado");

    const clean = this.cleanPayload(payload); // ya normaliza fechas
    const updates: Partial<Reto> = { ...clean };

    const rawAuto =
      (payload as any)?.esAutomaticoReto ??
      (payload as any)?.es_automatico_reto;
    const rawActivo = (payload as any)?.activo;
    if (rawAuto !== undefined)
      updates.esAutomaticoReto = Number(rawAuto) ? 1 : 0;
    if (rawActivo !== undefined) updates.activo = Number(rawActivo) ? 1 : 0;

    const rawConfig =
      (payload as any)?.config ??
      (payload as any)?.metadataReto ??
      (payload as any)?.metadata_reto;
    if (rawConfig !== undefined) {
      try {
        updates.metadataReto =
          typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;
      } catch {
        updates.metadataReto = null;
      }
    }

    let tipoReto: string | undefined =
      (payload as any)?.tipoReto ??
      (payload as any)?.tipo ??
      (payload as any)?.tipo_reto;
    tipoReto = tipoReto ? String(tipoReto).toLowerCase().trim() : undefined;

    if (
      !tipoReto &&
      updates.metadataReto &&
      typeof updates.metadataReto === "object"
    ) {
      const kind = String(
        (updates.metadataReto as any).kind ?? ""
      ).toLowerCase();
      if (["quiz", "form", "archivo"].includes(kind)) tipoReto = kind;
    }
    if (tipoReto) {
      if (!["quiz", "form", "archivo"].includes(tipoReto)) {
        throw new BadRequestException(
          'tipoReto inválido (usa "quiz", "form" o "archivo")'
        );
      }
      updates.tipoReto = tipoReto as any;
    }

    if (
      updates.nombreReto !== undefined &&
      !String(updates.nombreReto).trim()
    ) {
      throw new BadRequestException("nombreReto no puede ser vacío");
    }

    const ini = updates.fechaInicioReto ?? current.fechaInicioReto;
    const fin = updates.fechaFinReto ?? current.fechaFinReto;
    if (
      ini &&
      fin &&
      dayjs(fin, "YYYY-MM-DD", true).isBefore(dayjs(ini, "YYYY-MM-DD", true))
    ) {
      throw new BadRequestException(
        "fechaFinReto no puede ser anterior a fechaInicioReto"
      );
    }
    if (
      updates.tiempoEstimadoSegReto != null &&
      updates.tiempoEstimadoSegReto < 0
    ) {
      throw new BadRequestException("tiempoEstimadoSegReto debe ser >= 0");
    }

    const result = await this.retoRepo
      .createQueryBuilder()
      .update()
      .set(updates)
      .where("cod_reto = :id", { id })
      .execute();

    if (!result.affected) {
      throw new BadRequestException(
        "No se aplicaron cambios (revisa los campos enviados)"
      );
    }

    // Upsert de cargos si se envía cargoIds / cargos / cargosIds
    const cargoIds: number[] =
      (payload as any)?.cargoIds ??
      (payload as any)?.cargos ??
      (payload as any)?.cargosIds ??
      undefined;

    if (Array.isArray(cargoIds)) {
      const qr = this.ds.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();
      try {
        await this.replaceCargosForReto(qr, id, cargoIds);
        await qr.commitTransaction();
      } catch (e) {
        try {
          await qr.rollbackTransaction();
        } catch {}
        throw e;
      } finally {
        try {
          await qr.release();
        } catch {}
      }
    }

    const fresh = await this.retoRepo.findOne({ where: { codReto: id } });
    return this.toDTO(fresh!);
  }

  // ========== CREAR QUIZ COMPLETO ==========
  public async crearQuiz(payload: any) {
    // --- Cabecera del reto (igual que ya tenías) ---
    const nombreReto = String(
      payload?.nombreReto ?? payload?.nombre_reto ?? ""
    ).trim();
    if (!nombreReto) {
      throw new HttpException(
        "nombreReto es requerido",
        HttpStatus.BAD_REQUEST
      );
    }

    const descripcionReto =
      (payload?.descripcionReto ?? payload?.descripcion_reto ?? "") || "";

    const tiempoEstimadoSegRetoRaw =
      payload?.tiempoEstimadoSegReto ?? payload?.tiempo_estimado_seg_reto ?? 60;
    const tiempoEstimadoSegReto = Math.max(
      0,
      Math.trunc(Number(tiempoEstimadoSegRetoRaw))
    );
    if (!Number.isFinite(tiempoEstimadoSegReto)) {
      throw new HttpException(
        "tiempoEstimadoSegReto inválido",
        HttpStatus.BAD_REQUEST
      );
    }

    const fechaInicioReto = toMySqlDateOrNull(
      payload?.fechaInicioReto ?? payload?.fecha_inicio_reto ?? new Date()
    );
    const fechaFinReto = toMySqlDateOrNull(
      payload?.fechaFinReto ?? payload?.fecha_fin_reto ?? new Date()
    );
    if (!fechaInicioReto || !fechaFinReto) {
      throw new HttpException("Fechas inválidas", HttpStatus.BAD_REQUEST);
    }
    if (
      dayjs(fechaFinReto, "YYYY-MM-DD", true).isBefore(
        dayjs(fechaInicioReto, "YYYY-MM-DD", true)
      )
    ) {
      throw new HttpException(
        "fechaFinReto no puede ser anterior a fechaInicioReto",
        HttpStatus.BAD_REQUEST
      );
    }

    const esAutomaticoReto = Number(
      payload?.esAutomaticoReto ?? payload?.es_automatico_reto ?? 0
    )
      ? 1
      : 0;
    const activo = Number(payload?.activo ?? 1) ? 1 : 0;

    // Preguntas
    const preguntas: any[] = Array.isArray(payload?.preguntas)
      ? payload.preguntas
      : [];
    if (preguntas.length === 0) {
      throw new HttpException(
        "Debes enviar al menos 1 pregunta",
        HttpStatus.BAD_REQUEST
      );
    }

    // Transacción
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // 1) Insert reto (tipo quiz)
      const retoInsert = await qr.manager.query(
        `
        INSERT INTO retos (
          nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
          fecha_inicio_reto, fecha_fin_reto,
          es_automatico_reto, tipo_reto, metadata_reto, activo
        ) VALUES (?, ?, ?, ?, ?, ?, 'quiz', ?, ?)
        `,
        [
          nombreReto,
          descripcionReto,
          tiempoEstimadoSegReto,
          fechaInicioReto,
          fechaFinReto,
          esAutomaticoReto,
          JSON.stringify(
            payload?.metadataReto ??
              payload?.metadata_reto ??
              payload?.config ??
              null
          ),
          activo,
        ]
      );
      const codReto: number = Number(retoInsert?.insertId);
      if (!codReto) throw new Error("No se obtuvo codReto");

      // 2) Insert preguntas y dependientes
      let inserted = 0;

      for (let i = 0; i < preguntas.length; i++) {
        const p = preguntas[i] || {};
        const numero = Number(p?.numero ?? p?.numero_pregunta ?? i + 1);
        const enunciado = String(
          p?.enunciado ?? p?.enunciado_pregunta ?? ""
        ).trim();
        const tipo = String(p?.tipo ?? p?.tipo_pregunta ?? "")
          .toLowerCase()
          .trim();
        const puntos = Math.max(
          0,
          Math.trunc(Number(p?.puntos ?? p?.puntos_pregunta ?? 1))
        );
        const tiempoMax = Math.max(
          1,
          Math.trunc(Number(p?.tiempoMax ?? p?.tiempo_max_pregunta ?? 60))
        );

        if (!enunciado)
          throw new HttpException(
            `Pregunta #${i + 1}: enunciado requerido`,
            HttpStatus.BAD_REQUEST
          );
        if (!["abcd", "rellenar", "emparejar", "reporte"].includes(tipo)) {
          throw new HttpException(
            `Pregunta #${i + 1}: tipo inválido`,
            HttpStatus.BAD_REQUEST
          );
        }

        const pregRes = await qr.manager.query(
          `
    INSERT INTO preguntas (
      numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto
    ) VALUES (?, ?, ?, ?, ?, ?)
    `,
          [numero, enunciado, tipo, puntos, tiempoMax, codReto]
        );
        const codPregunta: number = Number(pregRes?.insertId);
        if (!codPregunta)
          throw new Error(`No se obtuvo codPregunta en #${i + 1}`);

        if (tipo === "abcd") {
          const opciones = Array.isArray(p?.opciones) ? p.opciones : [];
          if (opciones.length === 0) {
            throw new HttpException(
              `Pregunta #${i + 1}: requiere opciones (abcd)`,
              HttpStatus.BAD_REQUEST
            );
          }
          for (const opt of opciones) {
            const texto = String(opt?.texto ?? opt?.texto_opcion ?? "").trim();
            const correcta = Number(opt?.correcta ?? opt?.validez_opcion ?? 0)
              ? 1
              : 0;
            if (!texto)
              throw new HttpException(
                `Pregunta #${i + 1}: opción vacía`,
                HttpStatus.BAD_REQUEST
              );
            await qr.manager.query(
              `INSERT INTO opciones_abcd (texto_opcion, validez_opcion, cod_pregunta) VALUES (?, ?, ?)`,
              [texto, correcta, codPregunta]
            );
          }
        }

        if (tipo === "rellenar") {
          const resp = String(
            p?.rellenar?.respuesta ??
              p?.respuestaCorrecta ??
              p?.respuesta_correcta ??
              ""
          ).trim();
          if (!resp)
            throw new HttpException(
              `Pregunta #${i + 1}: respuesta_correcta requerida (rellenar)`,
              HttpStatus.BAD_REQUEST
            );
          await qr.manager.query(
            `INSERT INTO preguntas_rellenar (texto_pregunta, respuesta_correcta, cod_pregunta) VALUES (?, ?, ?)`,
            [enunciado, resp, codPregunta]
          );
        }

        if (tipo === "emparejar") {
          const A: string[] = Array.isArray(p?.emparejar?.A)
            ? p.emparejar.A
            : [];
          const B: string[] = Array.isArray(p?.emparejar?.B)
            ? p.emparejar.B
            : [];
          if (A.length === 0 || B.length === 0) {
            throw new HttpException(
              `Pregunta #${i + 1}: requiere listas A y B (emparejar)`,
              HttpStatus.BAD_REQUEST
            );
          }

          const idsA: number[] = [];
          for (const a of A) {
            const rA = await qr.manager.query(
              `INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta) VALUES ('A', ?, ?)`,
              [String(a), codPregunta]
            );
            idsA.push(Number(rA?.insertId));
          }

          const idsB: number[] = [];
          for (const b of B) {
            const rB = await qr.manager.query(
              `INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta) VALUES ('B', ?, ?)`,
              [String(b), codPregunta]
            );
            idsB.push(Number(rB?.insertId));
          }

          const parejas: Array<[number, number]> = Array.isArray(
            p?.emparejar?.parejas
          )
            ? p.emparejar.parejas
            : [];
          for (const par of parejas) {
            const [ia, ib] = par;
            const codA = idsA[ia];
            const codB = idsB[ib];
            if (!codA || !codB) {
              throw new HttpException(
                `Pregunta #${i + 1}: índice de pareja fuera de rango`,
                HttpStatus.BAD_REQUEST
              );
            }
            await qr.manager.query(
              `INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta) VALUES (?, ?, ?)`,
              [codA, codB, codPregunta]
            );
          }
        }

        // tipo 'reporte': no hay tabla hija → nada más que insertar en 'preguntas'
      }

      await qr.commitTransaction();

      const fresh = await this.retoRepo.findOne({
        where: { codReto },
        select: {
          codReto: true,
          nombreReto: true,
          descripcionReto: true,
          tiempoEstimadoSegReto: true,
          fechaInicioReto: true,
          fechaFinReto: true,
          tipoReto: true,
          esAutomaticoReto: true,
          activo: true,
          metadataReto: true,
        },
      });

      return {
        reto: this.toDTO(fresh!),
        preguntasInsertadas: inserted,
      };
    } catch (e: any) {
      try {
        await qr.rollbackTransaction();
      } catch {}
      console.error("[RETOS][crearQuiz] FAIL =>", {
        name: e?.name,
        message: e?.message,
        code: e?.code,
        errno: e?.errno,
        sqlMessage: e?.sqlMessage,
        sqlState: e?.sqlState,
        sql: e?.sql,
        stack: e?.stack,
      });
      if (e instanceof HttpException) throw e;
      if (e?.errno === 1366)
        throw new HttpException(
          "Valor inválido (enum/num)",
          HttpStatus.BAD_REQUEST
        );
      if (e?.errno === 1292)
        throw new HttpException("Fecha inválida", HttpStatus.BAD_REQUEST);
      throw new HttpException(
        "No se pudo crear el quiz",
        HttpStatus.BAD_REQUEST
      );
    } finally {
      try {
        await qr.release();
      } catch {}
    }
  }

  /**
   * ===== OPERARIOS del día =====
   */
  public async operariosStatsDia(isoYmd: string) {
    const fecha = dayjs(isoYmd, "YYYY-MM-DD", true);
    if (!fecha.isValid())
      throw new BadRequestException("Fecha inválida (YYYY-MM-DD)");
    const ymd = fecha.format("YYYY-MM-DD");

    const rows = await this.ds.query(
      `
      SELECT
        u.cod_usuario AS codUsuario,
        TRIM(CONCAT(COALESCE(u.nombre_usuario,''),' ',COALESCE(u.apellido_usuario,''))) AS nombre,
        COALESCE(rc.cnt, 0) AS retosCompletados,
        CASE WHEN COALESCE(ra.cnt,0) + COALESCE(rr.cnt,0) > 0 THEN 1 ELSE 0 END AS reportesSubidos
      FROM usuarios u

      -- retos COMPLETADOS ese día
      LEFT JOIN (
        SELECT ur.cod_usuario, COUNT(*) AS cnt
        FROM usuarios_retos ur
        WHERE ur.estado = 'completado'
          AND DATE(COALESCE(ur.fecha_complecion, ur.terminado_en)) = ?
        GROUP BY ur.cod_usuario
      ) rc ON rc.cod_usuario = u.cod_usuario

      -- archivos subidos por el usuario ese día
      LEFT JOIN (
        SELECT a.cod_usuario, COUNT(*) AS cnt
        FROM archivos a
        WHERE DATE(a.fecha_creacion) = ?
        GROUP BY a.cod_usuario
      ) ra ON ra.cod_usuario = u.cod_usuario

      -- respuestas a PREGUNTAS tipo 'reporte' ese día
      LEFT JOIN (
        SELECT ur.cod_usuario, COUNT(*) AS cnt
        FROM respuestas_preguntas_usuario rpu
        JOIN usuarios_retos ur ON ur.cod_usuario_reto = rpu.cod_usuario_reto
        JOIN preguntas p ON p.cod_pregunta = rpu.cod_pregunta
        WHERE p.tipo_pregunta = 'reporte'
          AND DATE(rpu.respondido_en) = ?
        GROUP BY ur.cod_usuario
      ) rr ON rr.cod_usuario = u.cod_usuario

      WHERE u.cod_rol = 2
      ORDER BY nombre ASC
      `,
      [ymd, ymd, ymd]
    );

    return rows.map((r: any) => ({
      codUsuario: Number(r.codUsuario),
      nombre: String(r.nombre ?? ""),
      retosCompletados: Number(r.retosCompletados ?? 0),
      reportesSubidos: !!r.reportesSubidos,
    }));
  }

  /** NUEVO: conteo total de operarios (cod_rol = 2) */
  public async contarOperarios(): Promise<{ total: number }> {
    const rows = await this.ds.query(
      `SELECT COUNT(*) AS total FROM usuarios WHERE cod_rol = 2`
    );
    return { total: Number(rows?.[0]?.total ?? 0) };
  }

  // ============== SOBRESCRIBIR QUIZ (ahora: UPSERT SEGURO) ==============
  public async sobrescribirQuiz(codReto: number, preguntas: any[]) {
    const reto = await this.retoRepo.findOne({ where: { codReto } });
    if (!reto) throw new NotFoundException("Reto no encontrado");
    if (reto.tipoReto !== "quiz")
      throw new BadRequestException("El reto no es de tipo quiz");

    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const actuales: Array<{
        codPregunta: number;
        numero: number;
        tipo: string;
      }> = await qr.manager.query(
        `SELECT cod_pregunta AS codPregunta, numero_pregunta AS numero, tipo_pregunta AS tipo
       FROM preguntas WHERE cod_reto=?`,
        [codReto]
      );
      const idsActuales = actuales.map((a) => a.codPregunta);

      const respCounts: Record<number, number> = {};
      if (idsActuales.length) {
        const inList = `(${idsActuales.join(",")})`;
        const rows = await qr.manager.query(
          `SELECT cod_pregunta AS codPregunta, COUNT(*) AS cnt
         FROM respuestas_preguntas_usuario
         WHERE cod_pregunta IN ${inList}
         GROUP BY cod_pregunta`
        );
        for (const r of rows) respCounts[Number(r.codPregunta)] = Number(r.cnt);
      }
      const actualById = new Map(actuales.map((a) => [a.codPregunta, a]));

      const vistos = new Set<number>();
      let upserted = 0;

      for (let i = 0; i < preguntas.length; i++) {
        const raw = preguntas[i] || {};
        const codPregunta =
          Number(raw?.codPregunta ?? raw?.cod_pregunta ?? 0) || null;
        const numero = Math.max(1, Math.trunc(Number(raw?.numero ?? i + 1)));
        const enunciado = String(
          raw?.enunciado ?? raw?.enunciado_pregunta ?? ""
        ).trim();
        const tipo = String(raw?.tipo ?? raw?.tipo_pregunta ?? "")
          .toLowerCase()
          .trim();
        const puntos = Math.max(
          0,
          Math.trunc(Number(raw?.puntos ?? raw?.puntos_pregunta ?? 1))
        );
        const tiempoMax = Math.max(
          1,
          Math.trunc(Number(raw?.tiempoMax ?? raw?.tiempo_max_pregunta ?? 60))
        );

        if (!enunciado)
          throw new BadRequestException(
            `Pregunta #${i + 1}: enunciado requerido`
          );
        if (!["abcd", "rellenar", "emparejar", "reporte"].includes(tipo)) {
          throw new BadRequestException(`Pregunta #${i + 1}: tipo inválido`);
        }

        if (codPregunta && actualById.has(codPregunta)) {
          vistos.add(codPregunta);
          const prev = actualById.get(codPregunta)!;
          const tieneResp = (respCounts[codPregunta] ?? 0) > 0;
          const tipoToUse = tieneResp ? prev.tipo : tipo;

          await qr.manager.query(
            `UPDATE preguntas
           SET numero_pregunta=?, enunciado_pregunta=?, tipo_pregunta=?, puntos_pregunta=?, tiempo_max_pregunta=?
           WHERE cod_pregunta=?`,
            [numero, enunciado, tipoToUse, puntos, tiempoMax, codPregunta]
          );

          if (!tieneResp && prev.tipo !== tipo) {
            await this.clearTipoDependientes(qr, codPregunta, prev.tipo);
          }

          if (tipoToUse === "abcd") {
            await this.upsertOpcionesABCD(qr, codPregunta, raw?.opciones);
            if (!tieneResp && prev.tipo !== "abcd") {
              await this.clearTipoDependientes(qr, codPregunta, "rellenar");
              await this.clearTipoDependientes(qr, codPregunta, "emparejar");
            }
          } else if (tipoToUse === "rellenar") {
            const resp = String(
              raw?.rellenar?.respuesta ?? raw?.respuestaCorrecta ?? ""
            ).trim();
            if (!resp)
              throw new BadRequestException(
                `Pregunta #${i + 1}: respuesta_correcta requerida (rellenar)`
              );
            await this.upsertRellenar(qr, codPregunta, enunciado, resp);
            if (!tieneResp && prev.tipo !== "rellenar") {
              await this.clearTipoDependientes(qr, codPregunta, "abcd");
              await this.clearTipoDependientes(qr, codPregunta, "emparejar");
            }
          } else if (tipoToUse === "emparejar") {
            await this.replaceEmparejar(qr, codPregunta, raw?.emparejar);
            if (!tieneResp && prev.tipo !== "emparejar") {
              await this.clearTipoDependientes(qr, codPregunta, "abcd");
              await this.clearTipoDependientes(qr, codPregunta, "rellenar");
            }
          }
          // tipo 'reporte': no hay dependientes que gestionar

          upserted++;
        } else {
          const res = await qr.manager.query(
            `INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
           VALUES (?, ?, ?, ?, ?, ?)`,
            [numero, enunciado, tipo, puntos, tiempoMax, codReto]
          );
          const newId: number = Number(res?.insertId);
          if (!newId) throw new Error("No se obtuvo codPregunta (insert)");

          if (tipo === "abcd") {
            await this.upsertOpcionesABCD(qr, newId, raw?.opciones);
          } else if (tipo === "rellenar") {
            const resp = String(
              raw?.rellenar?.respuesta ?? raw?.respuestaCorrecta ?? ""
            ).trim();
            if (!resp)
              throw new BadRequestException(
                `Pregunta #${i + 1}: respuesta_correcta requerida (rellenar)`
              );
            await this.upsertRellenar(qr, newId, enunciado, resp);
          } else if (tipo === "emparejar") {
            await this.replaceEmparejar(qr, newId, raw?.emparejar);
          }
          // tipo 'reporte': no requiere tablas hijas

          upserted++;
        }
      }

      // Bajas/archivados
      let eliminadas = 0;
      let archivadas = 0;
      for (const p of actuales) {
        if (vistos.has(p.codPregunta)) continue;
        const tieneResp = (respCounts[p.codPregunta] ?? 0) > 0;
        if (!tieneResp) {
          await this.clearAllTipos(qr, p.codPregunta);
          await qr.manager.query(`DELETE FROM preguntas WHERE cod_pregunta=?`, [
            p.codPregunta,
          ]);
          eliminadas++;
        } else {
          await qr.manager.query(
            `UPDATE preguntas
           SET numero_pregunta = -ABS(numero_pregunta),
               enunciado_pregunta = CONCAT('[ARCHIVADA] ', enunciado_pregunta)
           WHERE cod_pregunta=?`,
            [p.codPregunta]
          );
          archivadas++;
        }
      }

      await qr.commitTransaction();
      return {
        ok: true,
        codReto,
        preguntasUpsertadas: upserted,
        archivadas,
        eliminadas,
      };
    } catch (e) {
      try {
        await qr.rollbackTransaction();
      } catch {}
      throw e;
    } finally {
      try {
        await qr.release();
      } catch {}
    }
  }

  // ------- helpers -------
  private cleanPayload(p: any): Partial<Reto> {
    const nombreReto: string | undefined = p?.nombreReto ?? p?.nombre_reto;
    const descripcionReto: string | null =
      (p?.descripcionReto ?? p?.descripcion_reto ?? null) || null;

    const tiempoEstimadoSegReto: number | null = toIntOrNull(
      p?.tiempoEstimadoSegReto ?? p?.tiempo_estimado_seg_reto
    );

    const fechaInicioReto: string | null = toMySqlDateOrNull(
      p?.fechaInicioReto ?? p?.fecha_inicio_reto
    );
    const fechaFinReto: string | null = toMySqlDateOrNull(
      p?.fechaFinReto ?? p?.fecha_fin_reto
    );

    return {
      nombreReto,
      descripcionReto,
      tiempoEstimadoSegReto,
      fechaInicioReto,
      fechaFinReto,
    } as Partial<Reto>;
  }

  private async upsertOpcionesABCD(
    qr: any,
    codPregunta: number,
    opcionesRaw: any
  ) {
    const opciones = Array.isArray(opcionesRaw) ? opcionesRaw : [];
    if (opciones.length === 0)
      throw new BadRequestException("ABCD: requiere opciones");

    const existentes: Array<{ codOpcion: number }> = await qr.manager.query(
      `SELECT cod_opcion AS codOpcion FROM opciones_abcd WHERE cod_pregunta=?`,
      [codPregunta]
    );
    const byId = new Map<number, true>(
      existentes.map((o) => [o.codOpcion, true])
    );
    const vistos = new Set<number>();

    for (const o of opciones) {
      const codOpcion = Number(o?.codOpcion ?? o?.cod_opcion ?? 0) || null;
      const texto = String(o?.texto ?? o?.texto_opcion ?? "").trim();
      const correcta = Number(o?.correcta ?? o?.validez_opcion ?? 0) ? 1 : 0;
      if (!texto) throw new BadRequestException("ABCD: opción vacía");

      if (codOpcion && byId.has(codOpcion)) {
        await qr.manager.query(
          `UPDATE opciones_abcd SET texto_opcion=?, validez_opcion=? WHERE cod_opcion=? AND cod_pregunta=?`,
          [texto, correcta, codOpcion, codPregunta]
        );
        vistos.add(codOpcion);
      } else {
        await qr.manager.query(
          `INSERT INTO opciones_abcd (texto_opcion, validez_opcion, cod_pregunta) VALUES (?, ?, ?)`,
          [texto, correcta, codPregunta]
        );
      }
    }

    // Borrar las que ya no están
    if (existentes.length) {
      const aBorrar = existentes
        .map((o) => o.codOpcion)
        .filter((id) => !vistos.has(id));
      if (aBorrar.length) {
        const inList = `(${aBorrar.join(",")})`;
        await qr.manager.query(
          `DELETE FROM opciones_abcd WHERE cod_pregunta=? AND cod_opcion IN ${inList}`,
          [codPregunta]
        );
      }
    }
  }

  private async upsertRellenar(
    qr: any,
    codPregunta: number,
    enunciado: string,
    resp: string
  ) {
    const [row] = await qr.manager.query(
      `SELECT cod_pregunta FROM preguntas_rellenar WHERE cod_pregunta=?`,
      [codPregunta]
    );
    if (row) {
      await qr.manager.query(
        `UPDATE preguntas_rellenar SET texto_pregunta=?, respuesta_correcta=? WHERE cod_pregunta=?`,
        [enunciado, resp, codPregunta]
      );
    } else {
      await qr.manager.query(
        `INSERT INTO preguntas_rellenar (texto_pregunta, respuesta_correcta, cod_pregunta) VALUES (?, ?, ?)`,
        [enunciado, resp, codPregunta]
      );
    }
  }

  private async upsertReporte(qr: any, codPregunta: number, data: any) {
    const instrucciones =
      String(data?.instrucciones ?? "").trim() ||
      "Adjunta el archivo solicitado";
    const tiposRaw: string[] = Array.isArray(data?.tipos) ? data.tipos : [];
    const ALLOWED = new Set(["pdf", "jpg", "png", "docx"]);
    const tipos = tiposRaw
      .map((t) => String(t).toLowerCase().trim())
      .filter((t) => ALLOWED.has(t));
    if (tipos.length === 0)
      throw new BadRequestException("Reporte: tipos inválidos o vacíos");

    const [row] = await qr.manager.query(
      `SELECT cod_pregunta FROM preguntas_reporte WHERE cod_pregunta=?`,
      [codPregunta]
    );
    const setValue = tipos.join(",");
    if (row) {
      await qr.manager.query(
        `UPDATE preguntas_reporte SET instrucciones_pregunta=?, tipo_archivo_permitido=? WHERE cod_pregunta=?`,
        [instrucciones, setValue, codPregunta]
      );
    } else {
      await qr.manager.query(
        `INSERT INTO preguntas_reporte (instrucciones_pregunta, tipo_archivo_permitido, cod_pregunta) VALUES (?, ?, ?)`,
        [instrucciones, setValue, codPregunta]
      );
    }
  }

  private async replaceEmparejar(qr: any, codPregunta: number, emp: any) {
    const A: string[] = Array.isArray(emp?.A) ? emp.A : [];
    const B: string[] = Array.isArray(emp?.B) ? emp.B : [];
    const parejas: Array<[number, number]> = Array.isArray(emp?.parejas)
      ? emp.parejas
      : [];
    if (A.length === 0 || B.length === 0)
      throw new BadRequestException("Emparejar: requiere listas A y B");

    // Borra items/pParejas y vuelve a crear
    await qr.manager.query(
      `DELETE FROM parejas_correctas WHERE cod_pregunta=?`,
      [codPregunta]
    );
    await qr.manager.query(
      `DELETE FROM items_emparejamiento WHERE cod_pregunta=?`,
      [codPregunta]
    );

    const idsA: number[] = [];
    for (const a of A) {
      const rA = await qr.manager.query(
        `INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta) VALUES ('A', ?, ?)`,
        [String(a), codPregunta]
      );
      idsA.push(Number(rA?.insertId));
    }
    const idsB: number[] = [];
    for (const b of B) {
      const rB = await qr.manager.query(
        `INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta) VALUES ('B', ?, ?)`,
        [String(b), codPregunta]
      );
      idsB.push(Number(rB?.insertId));
    }
    for (const [ia, ib] of parejas) {
      const codA = idsA[ia];
      const codB = idsB[ib];
      if (!codA || !codB)
        throw new BadRequestException("Emparejar: pareja fuera de rango");
      await qr.manager.query(
        `INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta) VALUES (?, ?, ?)`,
        [codA, codB, codPregunta]
      );
    }
  }

  private async replaceCargosForReto(
    trx: DataSource | { query: Function },
    codReto: number,
    cargoIds: number[]
  ) {
    // Limpia actuales
    await (trx as any).query(`DELETE FROM cargos_retos WHERE cod_reto=?`, [
      codReto,
    ]);

    const ids = (cargoIds || [])
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n > 0);

    if (!ids.length) return;

    // Inserción masiva
    const values = ids.map(() => "(?, ?)").join(",");
    const params: any[] = [];
    for (const id of ids) {
      params.push(id, codReto);
    }
    await (trx as any).query(
      `INSERT INTO cargos_retos (cod_cargo_usuario, cod_reto) VALUES ${values}`,
      params
    );
  }

  private async clearTipoDependientes(
    qr: any,
    codPregunta: number,
    tipo: string
  ) {
    if (tipo === "abcd") {
      await qr.manager.query(`DELETE FROM opciones_abcd WHERE cod_pregunta=?`, [
        codPregunta,
      ]);
    } else if (tipo === "rellenar") {
      await qr.manager.query(
        `DELETE FROM preguntas_rellenar WHERE cod_pregunta=?`,
        [codPregunta]
      );
    } else if (tipo === "emparejar") {
      await qr.manager.query(
        `DELETE FROM parejas_correctas WHERE cod_pregunta=?`,
        [codPregunta]
      );
      await qr.manager.query(
        `DELETE FROM items_emparejamiento WHERE cod_pregunta=?`,
        [codPregunta]
      );
    }
    // tipo 'reporte': sin dependientes en tu esquema
  }

  private async clearAllTipos(qr: any, codPregunta: number) {
    await qr.manager.query(
      `DELETE FROM parejas_correctas WHERE cod_pregunta=?`,
      [codPregunta]
    );
    await qr.manager.query(
      `DELETE FROM items_emparejamiento WHERE cod_pregunta=?`,
      [codPregunta]
    );
    await qr.manager.query(
      `DELETE FROM preguntas_rellenar WHERE cod_pregunta=?`,
      [codPregunta]
    );
    await qr.manager.query(`DELETE FROM opciones_abcd WHERE cod_pregunta=?`, [
      codPregunta,
    ]);
    // nada para 'reporte'
  }

  // Dentro de RetoService
public async cargosDeReto(codReto: number): Promise<Array<{ id: number; nombre: string }>> {
  const id = Number(codReto);
  if (!Number.isFinite(id) || id <= 0) throw new BadRequestException('codReto inválido');

  const rows = await this.ds.query(
    `
    SELECT cu.cod_cargo_usuario AS id, cu.nombre_cargo AS nombre
    FROM cargos_retos cr
    JOIN cargos_usuarios cu ON cu.cod_cargo_usuario = cr.cod_cargo_usuario
    WHERE cr.cod_reto = ?
    ORDER BY cu.nombre_cargo ASC
    `,
    [id]
  );
  return rows; // [{id, nombre}]
}

}

/* ===== Utils ===== */
function toIntOrNull(v: any): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function safeParseJson(v: any): any {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

// DATE (YYYY-MM-DD) — FIX: si viene string YYYY-MM-DD, lo devolvemos tal cual.
function toMySqlDateOrNull(v: any): string | null {
  if (v === undefined || v === null || v === "") return null;

  if (typeof v === "string") {
    const s = v.trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return s; // mantener la fecha exacta sin tocar TZ
    const d = dayjs(s);
    return d.isValid() ? d.format("YYYY-MM-DD") : null;
  }

  const d = dayjs(v);
  return d.isValid() ? d.format("YYYY-MM-DD") : null;
}

function toMySqlDateTimeOrNull(v: any): string | null {
  if (v === undefined || v === null || v === "") return null;
  const d = dayjs(v);
  return d.isValid() ? d.format("YYYY-MM-DD HH:mm:ss") : null;
}

function pickIcon(tipo: string, meta?: any): string {
  const fromMeta = (meta?.icon ?? meta?.icono ?? meta?.emoji ?? "")
    .toString()
    .trim();
  if (fromMeta) return fromMeta; // emoji o Ionicons

  const t = String(tipo ?? "").toLowerCase();
  switch (t) {
    case "quiz":
      return "help-circle";
    case "archivo":
      return "document-attach";
    case "form":
    default:
      return "document-text";
  }
}
