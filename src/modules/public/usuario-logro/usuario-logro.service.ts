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
      where: { codUsuario },
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
}
