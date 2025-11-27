import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class EstadisticaUsuarioService {
  // Repositorio 1:1 con la tabla de estadísticas de usuario
  private statsRepo: Repository<EstadisticaUsuario>;

  constructor(private readonly poolConexion: DataSource) {
    this.statsRepo = this.poolConexion.getRepository(EstadisticaUsuario);
  }

  /**
   * Obtiene las estadísticas del usuario (monedas, racha, XP, nivel).
   * Lanza 404 si el usuario no tiene registro de estadísticas.
   */
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
      // nivel calculado a partir de la XP total y el valor configurado por nivel
      nivel: stats.xp / Number(process.env.XP_POR_NIVEL),
    };
  }

  /**
   * Suma monedas de forma atómica directamente en BD.
   * Útil para evitar condiciones de carrera al dar recompensas.
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
   * Suma XP de forma atómica directamente en BD.
   * No lee el valor actual en memoria, todo se hace vía SQL.
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
   * Incrementa la racha en 1 (por ejemplo al completar un reto hoy).
   * Es un aumento atómico sobre la columna de racha.
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
   * Resetea la racha del usuario a 0.
   * Se usa cuando el usuario rompe su racha diaria.
   */
  async resetearRacha(codUsuario: number) {
    await this.statsRepo.update(
      { usuario: { codUsuario } },
      { racha: 0 },
    );
  }
}
