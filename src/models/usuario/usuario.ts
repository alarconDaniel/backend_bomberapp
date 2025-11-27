// src/db/entities/Usuario.ts
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  RelationId,
} from 'typeorm';
import { Rol } from '../rol/rol';
import { CargoUsuario } from '../cargo_usuario/cargo-usuario';
import { EstadisticaUsuario } from '../estadistica-usuario/estadistica-usuario';
import { ItemInventario } from '../item_inventario/item_inventario';

@Entity({ name: 'usuarios' })
export class Usuario {
  /**
   * Identificador interno del usuario en el sistema.
   */
  @PrimaryGeneratedColumn({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  /**
   * Nombre real del usuario (dato de identificación).
   */
  @Column({ name: 'nombre_usuario', type: 'varchar', length: 255 })
  nombreUsuario!: string;

  /**
   * Apellido del usuario.
   */
  @Column({ name: 'apellido_usuario', type: 'varchar', length: 255 })
  apellidoUsuario!: string;

  /**
   * Documento de identidad o cédula del usuario.
   */
  @Column({ name: 'cedula_usuario', type: 'varchar', length: 255 })
  cedulaUsuario!: string;

  /**
   * Alias o nickname visible en la parte “gamificada”.
   * Puede ser nulo si el usuario aún no lo ha configurado.
   */
  @Column({ name: 'nickname_usuario', type: 'varchar', length: 255, nullable: true })
  nicknameUsuario!: string | null;

  /**
   * Correo principal de acceso y notificación.
   */
  @Column({ name: 'correo_usuario', type: 'varchar', length: 255 })
  correoUsuario!: string;

  /**
   * Contraseña hasheada (p. ej. con Argon2).
   * Nunca debe almacenarse la contraseña en texto plano.
   */
  @Column({ name: 'contrasena_usuario', type: 'varchar', length: 255 })
  contrasenaUsuario!: string;

  /**
   * Hash del refresh token activo del usuario.
   * Permite invalidar sesiones específicas sin cambiar la contraseña.
   */
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 500, nullable: true })
  refreshTokenHash!: string | null;

  /**
   * Versión de tokens del usuario.
   * Al incrementarse, invalida todos los refresh tokens previos.
   */
  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion!: number;

  // --------- Relaciones ---------

  /**
   * Rol asignado al usuario (admin, operario, etc.).
   * Se carga en eager para tener el rol disponible en cada consulta.
   */
  @ManyToOne(() => Rol, (r) => r.usuarios, { eager: true })
  @JoinColumn({ name: 'cod_rol', referencedColumnName: 'codRol' })
  rol!: Rol;

  /**
   * Identificador del rol asociado, derivado de la relación.
   * No crea una columna extra, solo expone la FK como propiedad.
   */
  @RelationId((usuario: Usuario) => usuario.rol)
  codRol!: number;

  /**
   * Cargo o posición del usuario dentro de la organización.
   * Es opcional, puede ser nulo.
   */
  @ManyToOne(() => CargoUsuario, (c) => c.usuarios, { eager: true, nullable: true })
  @JoinColumn({ name: 'cod_cargo_usuario', referencedColumnName: 'codCargoUsuario' })
  cargo!: CargoUsuario | null;

  /**
   * Identificador del cargo asociado, calculado a partir de la relación.
   */
  @RelationId((usuario: Usuario) => usuario.cargo)
  codCargoUsuario!: number | null;

  /**
   * Estadísticas acumuladas del usuario (monedas, racha, XP, etc.).
   * Relación 1:1; puede no existir aún para usuarios nuevos.
   */
  @OneToOne(() => EstadisticaUsuario, (e) => e.usuario, { nullable: true })
  estadisticas!: EstadisticaUsuario | null;

  /**
   * Ítems que el usuario tiene actualmente en su inventario.
   */
  @OneToMany(() => ItemInventario, (ii) => ii.usuario)
  itemsInventario!: ItemInventario[];
}
