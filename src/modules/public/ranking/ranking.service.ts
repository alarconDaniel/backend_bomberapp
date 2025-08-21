// src/modules/public/ranking/ranking.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

type TopItem = {
    codUsuario: number;
    nombre: string;
    apellido: string;
    nickname: string | null;
    xp: number;
    nivel: number;
};

type MeInfo = {
    position: number;
    xp: number;
    nivel: number;
};

type TrophyItem = {
    codTrofeo: number;
    nombre: string;
    icono: string;
    holder: null | {
        codUsuario: number;
        nombre: string;
        nickname: string | null;
    };
};

@Injectable()
export class RankingService {
    constructor(
        private readonly ds: DataSource,
        private readonly cfg: ConfigService,
    ) { }

    private xpPorNivel(): number {
        const v = Number(this.cfg.get<string>('XP_POR_NIVEL') ?? '1000');
        return Number.isFinite(v) && v > 0 ? v : 1000;
    }

    /**
     * Top N por XP total (desempate por cod_usuario asc).
     */
    async topXP(limit = 5): Promise<TopItem[]> {
        const rows = await this.ds.query<{
            codUsuario: number;
            nombre: string;
            apellido: string;
            nickname: string | null;
            xp: number;
        }[]>(
            `
      SELECT u.cod_usuario   AS codUsuario,
             u.nombre_usuario AS nombre,
             u.apellido_usuario AS apellido,
             u.nickname_usuario AS nickname,
             eu.xp_estadistica AS xp
        FROM usuarios u
        JOIN estadisticas_usuarios eu ON eu.cod_usuario = u.cod_usuario
    ORDER BY eu.xp_estadistica DESC, u.cod_usuario ASC
       LIMIT ?
      `,
            [limit],
        );

        const XP = this.xpPorNivel();
        return rows.map(r => ({
            ...r,
            nivel: Math.floor(r.xp / XP) + 1,
        }));
    }

    /**
     * Posición global del usuario por XP (1-based).
     * Empates se resuelven dejando primero a quien tenga mayor XP, y si hay igualdad exacta de XP,
     * cuenta cuántos tienen XP estrictamente mayor (posición = mayores + 1).
     */
    async posicionUsuario(codUsuario: number): Promise<MeInfo> {
        const XP = this.xpPorNivel();

        // XP del usuario
        const me = await this.ds.query<{ xp: number }[]>(
            `SELECT eu.xp_estadistica AS xp
         FROM estadisticas_usuarios eu
        WHERE eu.cod_usuario = ?`,
            [codUsuario],
        );
        const myXP = Number(me[0]?.xp ?? 0);

        // Cuántos tienen más XP
        const above = await this.ds.query<{ c: number }[]>(
            `SELECT COUNT(*) AS c
         FROM estadisticas_usuarios x
        WHERE x.xp_estadistica > ?`,
            [myXP],
        );
        const position = Number(above[0]?.c ?? 0) + 1;
        const nivel = Math.floor(myXP / XP) + 1;

        return { position, xp: myXP, nivel };
    }

    /**
     * Lista todos los trofeos y, si aplica, quién los posee ahora.
     */
    // + descripcion en el SELECT y en el map
    async listarTrofeos(): Promise<
        { codTrofeo: number; nombre: string; icono: string; descripcion: string; holder: null | { codUsuario: number; nombre: string; nickname: string | null } }[]
    > {
        const rows = await this.ds.query<{
            codTrofeo: number;
            nombre: string;
            icono: string;
            descripcion: string;
            holderCod: number | null;
            holderNombre: string | null;
            holderNick: string | null;
        }[]>(
            `
    SELECT t.cod_trofeo      AS codTrofeo,
           t.nombre_trofeo    AS nombre,
           t.icono_trofeo     AS icono,
           t.descripcion_trofeo AS descripcion,
           u.cod_usuario      AS holderCod,
           u.nombre_usuario   AS holderNombre,
           u.nickname_usuario AS holderNick
      FROM trofeos t
 LEFT JOIN usuarios u ON u.cod_usuario = t.cod_usuario
  ORDER BY t.cod_trofeo ASC
    `,
        );

        return rows.map(r => ({
            codTrofeo: r.codTrofeo,
            nombre: r.nombre,
            icono: r.icono,
            descripcion: r.descripcion,
            holder: r.holderCod
                ? { codUsuario: r.holderCod, nombre: r.holderNombre!, nickname: r.holderNick }
                : null,
        }));
    }

}
