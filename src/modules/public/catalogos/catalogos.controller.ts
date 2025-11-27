import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DataSource } from 'typeorm';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Catálogos ligeros para la UI (combos / selects).
 * Por ahora sólo expone el catálogo de cargos de usuario.
 */
@ApiTags('catálogos')
@ApiBearerAuth('access-token') 
@UseGuards(AuthGuard('jwt'))
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly ds: DataSource) {}
  /**
   * Devuelve el catálogo de cargos de usuario ordenados alfabéticamente.
   * Útil para llenar selects en formularios (alta/edición de usuario).
   */
  @Get('cargos')
  @ApiOperation({
    summary: 'Listar cargos',
    description: 'Devuelve el catálogo de cargos de usuario (id, nombre) ordenado por nombre.',
  })
  @ApiOkResponse({
    description: 'Listado de cargos disponible para la aplicación.',
    isArray: true,
  })
  async cargos() {
    const rows = await this.ds.query(
      `SELECT cod_cargo_usuario AS id, nombre_cargo AS nombre
       FROM cargos_usuarios
       ORDER BY nombre_cargo ASC`,
    );
    return rows; // [{ id, nombre }]
  }
}
