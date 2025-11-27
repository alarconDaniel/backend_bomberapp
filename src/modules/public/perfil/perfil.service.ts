import { Injectable } from '@nestjs/common';

/**
 * Servicio de perfil.
 *
 * Por ahora actúa como punto de extensión para lógica
 * de dominio relacionada con "mi-perfil" que no encaje
 * directamente en otros servicios (usuario, stats, logros).
 */
@Injectable()
export class PerfilService {}
