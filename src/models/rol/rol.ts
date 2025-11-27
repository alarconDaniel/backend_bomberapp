// src/db/entities/Rol.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';

/**
 * Catálogo de roles del sistema.
 *
 * Datos base en BD:
 * - "admin"    → acceso completo a panel / configuración
 * - "operario" → uso operativo de retos y registro de información
 *
 * Si se agregan nuevos roles, hay que coordinar con autenticación/autorización
 * y con el front para que respeten estos nombres.
 */
@Entity({ name: 'roles' })
export class Rol {
  /** PK autoincremental del rol (`roles.cod_rol`). */
  @PrimaryGeneratedColumn({ name: 'cod_rol', type: 'int' })
  codRol!: number;

  /**
   * Nombre del rol.
   * Ejemplos actuales: "admin", "operario".
   * Se usa para controlar permisos a nivel de aplicación.
   */
  @Column({ name: 'nombre_rol', type: 'varchar', length: 255 })
  nombreRol!: string;

  /**
   * Relación 1:N con usuarios.
   * Cada usuario apunta a un único rol a través de `usuarios.cod_rol`.
   */
  @OneToMany(() => Usuario, (u) => u.rol)
  usuarios!: Usuario[];
}
