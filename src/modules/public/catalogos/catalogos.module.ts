import { Module } from '@nestjs/common';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';

/**
 * Módulo de catálogos de apoyo para la UI (combos, selects, etc.).
 * Registra el controller y el servicio asociado para exponer datos ligeros.
 */
@Module({
  controllers: [CatalogosController],
  providers: [CatalogosService],
})
export class CatalogosModule {}
