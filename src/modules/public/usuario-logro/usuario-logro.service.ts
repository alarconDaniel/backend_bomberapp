// src/modules/public/usuario-logro/usuario-logro.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UsuarioLogro } from 'src/models/usuario-logro/usuario-logro';

/**
 * Servicio para consultar logros asociados a un usuario:
 * - Últimos logros obtenidos (para tarjetas/resumen).
 * - Catálogo completo de logros con flag de desbloqueo.
 */
@Injectable()
export class UsuarioLogroService {
  private repo: Repository<UsuarioLogro>;

  constructor(private readonly ds: DataSource) {
    // Repositorio TypeORM sobre la tabla de unión usuarios_logros
    this.repo = this.ds.getRepository(UsuarioLogro);
  }

  /**
   * Devuelve los últimos `limit` logros desbloqueados por el usuario.
   * Se usa típicamente para mostrar un pequeño resumen en el perfil/home.
   */
  async ultimosDelUsuario(codUsuario: number, limit = 2) {
    const rows = await this.repo.find({
      where: { usuario: { codUsuario } },
      relations: ['logro'],
      order: { codUsuarioLogro: 'DESC' }, // los más recientes primero
      take: limit,
    });

    return rows.map(r => ({
      codLogro: r.logro.codLogro,
      nombre: r.logro.nombreLogro,
      icono: r.logro.iconoLogro, // ruta/clave tal como viene de BD
      recompensa: r.logro.recompensaLogro,
    }));
  }

  /**
   * Devuelve todos los logros del sistema, marcando cuáles
   * tiene desbloqueados el usuario (`unlocked`) y, si aplica,
   * la fecha de obtención.
   */
  async todosConEstado(codUsuario: number) {
    const rows = await this.ds
      .createQueryBuilder()
      .select('l.cod_logro', 'codLogro')
      .addSelect('l.nombre_logro', 'nombre')
      .addSelect('l.descripcion_logro', 'descripcion')
      .addSelect('l.icono_logro', 'icono')
      .addSelect('l.recompensa_logro', 'recompensa')
      .addSelect('ul.fecha_obtencion_logro', 'fechaObtencion')
      .from('logros', 'l')
      .leftJoin(
        'usuarios_logros',
        'ul',
        'ul.cod_logro = l.cod_logro AND ul.cod_usuario = :cod',
        { cod: codUsuario },
      )
      .orderBy('l.cod_logro', 'ASC')
      .getRawMany<{
        codLogro: number;
        nombre: string;
        descripcion: string;
        icono: string;
        recompensa: string;
        fechaObtencion: string | null;
      }>();

    return rows.map(r => ({
      codLogro: r.codLogro,
      nombre: r.nombre,
      descripcion: r.descripcion,
      icono: r.icono, // igual que en BD, lo resuelve el front
      recompensa: r.recompensa,
      unlocked: !!r.fechaObtencion,
      fechaObtencion: r.fechaObtencion || null,
    }));
  }
}
