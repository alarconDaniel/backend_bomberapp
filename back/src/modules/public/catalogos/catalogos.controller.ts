import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DataSource } from 'typeorm';

@UseGuards(AuthGuard('jwt'))
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly ds: DataSource) {}

  @Get('cargos')
  async cargos() {
    const rows = await this.ds.query(
      `SELECT cod_cargo_usuario AS id, nombre_cargo AS nombre
       FROM cargos_usuarios
       ORDER BY nombre_cargo ASC`
    );
    return rows; // [{id, nombre}]
  }
}
