import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class EstadisticaUsuarioService {

    private statsRepo: Repository<EstadisticaUsuario>;

    constructor(private readonly poolConexion: DataSource) {
        this.statsRepo = this.poolConexion.getRepository(EstadisticaUsuario);
    }

    async listarMisStats(codUsuario: number) {
        const stats = await this.statsRepo.findOne({
            where: { usuario: { codUsuario } }, // usa la relación 1:1
            relations: ['usuario'],
        });

        if (!stats) {
            throw new NotFoundException('No hay estadísticas para el usuario');
        }

        return {
            codUsuario,
            monedas: stats.monedas,
            racha: stats.racha,
            xp: stats.xp,
            nivel: (stats.xp) / Number(process.env.XP_POR_NIVEL),
        };
    }

    /**
   * Suma monedas de forma atómica.
   */
    async sumarMonedas(codUsuario: number, inc: number) {
        await this.statsRepo
            .createQueryBuilder()
            .update(EstadisticaUsuario)
            .set({ monedas: () => 'monedas_estadistica + :inc' })
            .where('cod_usuario = :codUsuario', { codUsuario })
            .setParameter('inc', inc)
            .execute();
    }

    /**
     * Suma XP de forma atómica.
     */
    async sumarXp(codUsuario: number, inc: number) {
        await this.statsRepo
            .createQueryBuilder()
            .update(EstadisticaUsuario)
            .set({ xp: () => 'xp_estadistica + :inc' })
            .where('cod_usuario = :codUsuario', { codUsuario })
            .setParameter('inc', inc)
            .execute();
    }

    /**
     * Incrementa racha (por ejemplo al completar un reto hoy).
     */
    async incrementarRacha(codUsuario: number) {
        await this.statsRepo
            .createQueryBuilder()
            .update(EstadisticaUsuario)
            .set({ racha: () => 'racha_estadistica + 1' })
            .where('cod_usuario = :codUsuario', { codUsuario })
            .execute();
    }

    /**
     * Resetea racha (si falló el día, etc.).
     */
    async resetearRacha(codUsuario: number) {
        await this.statsRepo.update(
            { usuario: { codUsuario } },
            { racha: 0 },
        );
    }
}
