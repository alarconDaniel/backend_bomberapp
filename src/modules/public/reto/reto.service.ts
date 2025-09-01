// src/modules/reto/reto.service.ts  
import { Injectable, NotFoundException, HttpException, HttpStatus, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Reto } from 'src/models/reto/reto';
import { UsuarioReto } from 'src/models/usuario-reto/usuario-reto';
import * as dayjs from 'dayjs';
const Holidays = require('date-holidays');

type RetoDTO = {
  codReto: number;
  nombreReto: string;
  descripcionReto: string | null;
  tiempoEstimadoSegReto: number | null;
  fechaInicioReto: string | null;
  fechaFinReto: string | null;
};

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
    // Bogotá fijo (sin DST)
    const hoyDate = new Date(`${hoyYmd}T00:00:00-05:00`);
    if (!this.isBusinessDay(hoyDate)) {
      return { ok: true, intentadas: 0, nuevas: 0, motivo: 'no-laboral', fecha: hoyYmd };
    }

    // Operarias
    const usuarios: Array<{ cod_usuario: number }> = await this.ds.query(
      'SELECT cod_usuario FROM usuarios WHERE cod_rol = 2'
    );

    // SOLO plantillas cuyo rango de vigencia cubre hoy
    const retosAuto: Array<{ cod_reto: number }> = await this.ds.query(
      `
    SELECT cod_reto
    FROM retos
    WHERE es_automatico_reto = 1
      AND fecha_inicio_reto <= ?
      AND fecha_fin_reto   >= ?
    `,
      [hoyYmd, hoyYmd]
    );

    if (!retosAuto.length || !usuarios.length) {
      return { ok: true, intentadas: 0, nuevas: 0, motivo: 'sin-usuarios-o-retos-vigentes', fecha: hoyYmd };
    }

    // Idempotencia: confía en tus UNIQUEs (uq_ur_dia / uq_ur_win)
    const insertSql = `
    INSERT IGNORE INTO usuarios_retos (cod_usuario, cod_reto, fecha_objetivo, estado)
    VALUES (?, ?, ?, 'asignado')
  `;

    let intentadas = 0, nuevas = 0;
    for (const u of usuarios) {
      for (const r of retosAuto) {
        intentadas++;
        const res: any = await this.ds.query(insertSql, [u.cod_usuario, r.cod_reto, hoyYmd]);
        // Nota: según el driver, res puede variar. En MySQL común: affectedRows=1 para insert real.
        if (res?.affectedRows === 1) nuevas++;
      }
    }
    return { ok: true, intentadas, nuevas, fecha: hoyYmd };
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
  private readonly repo: Repository<Reto>;


  private toDTO = (r: Partial<Reto>): RetoDTO => ({
    codReto: r.codReto!,
    nombreReto: r.nombreReto!,
    descripcionReto: (r as any).descripcionReto ?? null,
    tiempoEstimadoSegReto: (r as any).tiempoEstimadoSegReto ?? null,
    fechaInicioReto: (r as any).fechaInicioReto ?? null,
    fechaFinReto: (r as any).fechaFinReto ?? null,
  });

  /** NUEVO: devuelve el reto con estructura completa para renderizar (quiz o form) */
  public async verRetoFull(codReto: number) {
    const r = await this.retoRepo.findOne({ where: { codReto } });
    if (!r) throw new NotFoundException('Reto no encontrado');

    if (r.tipoReto === 'quiz') {
      // trae preguntas y subestructuras
      const preguntas = await this.ds.query(`
        SELECT p.cod_pregunta as codPregunta, p.numero_pregunta as numero,
               p.enunciado_pregunta as enunciado, p.tipo_pregunta as tipo,
               p.puntos_pregunta as puntos, p.tiempo_max_pregunta as tiempoMax
        FROM preguntas p WHERE p.cod_reto = ? ORDER BY p.numero_pregunta ASC
      `, [codReto]);

      // para cada tipo adjunta extras
      for (const q of preguntas) {
        if (q.tipo === 'abcd') {
          q.opciones = await this.ds.query(
            `SELECT cod_opcion as codOpcion, texto_opcion as texto, validez_opcion as correcta
               FROM opciones_abcd WHERE cod_pregunta=? ORDER BY cod_opcion ASC`,
            [q.codPregunta]
          );
        }
        if (q.tipo === 'rellenar') {
          const [row] = await this.ds.query(
            `SELECT respuesta_correcta as correcta FROM preguntas_rellenar WHERE cod_pregunta=?`,
            [q.codPregunta]
          );
          q.correcta = row?.correcta ?? null; // podrías omitirla al cliente si no quieres filtrar trampa
        }
        if (q.tipo === 'emparejar') {
          q.items = await this.ds.query(
            `SELECT cod_item as codItem, lado, contenido FROM items_emparejamiento WHERE cod_pregunta=? ORDER BY cod_item ASC`,
            [q.codPregunta]
          );
          q.parejas = await this.ds.query(
            `SELECT cod_item_A as a, cod_item_B as b FROM parejas_correctas WHERE cod_pregunta=?`,
            [q.codPregunta]
          );
        }
        if (q.tipo === 'reporte') {
          const [row] = await this.ds.query(
            `SELECT instrucciones_pregunta as instrucciones, tipo_archivo_permitido as tipos FROM preguntas_reporte WHERE cod_pregunta=?`,
            [q.codPregunta]
          );
          q.reporte = row ?? null;
        }
      }
      return { ...r, quiz: { preguntas } };
    } else {
      // form | checklist → usa metadata_reto.schema
      return { ...r, form: r.metadataReto?.schema ?? null };
    }
  }

  // ---------- LISTAR ----------
  public async listar(): Promise<RetoDTO[]> {
    const rows = await this.repo.find({
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
      order: { codReto: 'ASC' },
    });
    return rows.map(this.toDTO);
  }

  // ---------- DETALLE ----------
  public async detalle(codReto: number): Promise<RetoDTO> {
    const reto = await this.repo.findOne({
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
    if (!reto) throw new NotFoundException('Reto no encontrado');
    return this.toDTO(reto);
  }

  // ---------- CREAR ----------
  public async crear(payload: Partial<Reto>): Promise<RetoDTO> {
    try {
      const clean = this.cleanPayload(payload);

      if (!clean.nombreReto?.trim()) {
        throw new HttpException('nombreReto es requerido', HttpStatus.BAD_REQUEST);
      }
      if (
        clean.fechaInicioReto &&
        clean.fechaFinReto &&
        new Date(clean.fechaFinReto) < new Date(clean.fechaInicioReto)
      ) {
        throw new HttpException('fechaFinReto no puede ser anterior a fechaInicioReto', HttpStatus.BAD_REQUEST);
      }
      if (clean.tiempoEstimadoSegReto != null && clean.tiempoEstimadoSegReto < 0) {
        throw new HttpException('tiempoEstimadoSegReto debe ser >= 0', HttpStatus.BAD_REQUEST);
      }

      const reto = this.repo.create(clean as Partial<Reto>);
      const saved = await this.repo.save(reto);

      const fresh = await this.repo.findOne({
        where: { codReto: saved.codReto },
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
      return this.toDTO(fresh!);
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new HttpException('Reto duplicado', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('No se pudo crear el reto', HttpStatus.BAD_REQUEST);
    }
  }

  // ---------- BORRAR ----------
  public async borrar(codReto: number): Promise<{ ok: true }> {
    const r = await this.repo.delete({ codReto });
    if (!r.affected) throw new NotFoundException('Reto no encontrado');
    return { ok: true };
  }

  // ---------- MODIFICAR ----------
  public async modificar(codReto: number, payload: Partial<Reto>): Promise<RetoDTO> {
    const current = await this.repo.findOne({
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
    if (!current) throw new NotFoundException('Reto no encontrado');

    const clean = this.cleanPayload(payload);

    if (clean.nombreReto !== undefined && !String(clean.nombreReto).trim()) {
      throw new BadRequestException('nombreReto no puede ser vacío');
    }
    if ((clean.fechaInicioReto ?? current.fechaInicioReto) && (clean.fechaFinReto ?? current.fechaFinReto)) {
      const ini = new Date(clean.fechaInicioReto ?? current.fechaInicioReto!);
      const fin = new Date(clean.fechaFinReto ?? current.fechaFinReto!);
      if (fin < ini) throw new BadRequestException('fechaFinReto no puede ser anterior a fechaInicioReto');
    }
    if (clean.tiempoEstimadoSegReto != null && clean.tiempoEstimadoSegReto < 0) {
      throw new BadRequestException('tiempoEstimadoSegReto debe ser >= 0');
    }

    await this.repo.update({ codReto }, { ...current, ...clean, codReto });
    const fresh = await this.repo.findOne({
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
    return this.toDTO(fresh!);
  }

  // ------- helpers -------
  private cleanPayload(p: any): Partial<Reto> {
    const nombreReto: string | undefined = p?.nombreReto ?? p?.nombre_reto;
    const descripcionReto: string | null =
      (p?.descripcionReto ?? p?.descripcion_reto ?? null) || null;

    const tiempoEstimadoSegReto: number | null = toIntOrNull(
      p?.tiempoEstimadoSegReto ?? p?.tiempo_estimado_seg_reto,
    );

    const fechaInicioReto: string | null = toMySqlDateTimeOrNull(
      p?.fechaInicioReto ?? p?.fecha_inicio_reto,
    );
    const fechaFinReto: string | null = toMySqlDateTimeOrNull(
      p?.fechaFinReto ?? p?.fecha_fin_reto,
    );

    return {
      nombreReto,
      descripcionReto,
      tiempoEstimadoSegReto,
      fechaInicioReto,
      fechaFinReto,
    } as Partial<Reto>;
  }
}

function toIntOrNull(v: any): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toMySqlDateTimeOrNull(v: any): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}
