import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UsuarioLogro } from 'src/models/usuario-logro/usuario-logro';

@Injectable()
export class UsuarioLogroService {
  private repo: Repository<UsuarioLogro>;
  constructor(private readonly ds: DataSource) {
    this.repo = this.ds.getRepository(UsuarioLogro);
  }

  async ultimosDelUsuario(codUsuario: number, limit = 2) {
    const rows = await this.repo.find({
      where: { usuario: { codUsuario } },
      relations: ['logro'],
      order: { codUsuarioLogro: 'DESC' },
      take: limit,
    });

    return rows.map(r => ({
      codLogro: r.logro.codLogro,
      nombre: r.logro.nombreLogro,
      icono: r.logro.iconoLogro,         // ruta (la devuelves como venga de la BD)
      recompensa: r.logro.recompensaLogro,
    }));
  }

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
      .leftJoin('usuarios_logros', 'ul', 'ul.cod_logro = l.cod_logro AND ul.cod_usuario = :cod', { cod: codUsuario })
      .orderBy('l.cod_logro', 'ASC')
      .getRawMany<{
        codLogro: number;
        nombre: string;
        descripcion: string;
        icono: string;
        recompensa: string;
        fechaObtencion: string | null;
      }>();


    return rows.map((r) => ({
      codLogro: r.codLogro,
      nombre: r.nombre,
      descripcion: r.descripcion,
      icono: r.icono,
      recompensa: r.recompensa,
      unlocked: !!r.fechaObtencion,
      fechaObtencion: r.fechaObtencion || null,
    }));
  }
}
