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

@Entity({ name: 'usuarios' })
/**
 * User entity representing an application user.
 * Includes authentication data and a relation to a role.
 */
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'cod_usuario', type: 'int' })
  // Unique identifier for the user.
  codUsuario!: number;

  @Column({ name: 'nombre_usuario', type: 'varchar', length: 255 })
  // First name of the user.
  nombreUsuario!: string;

  @Column({ name: 'apellido_usuario', type: 'varchar', length: 255 })
  // Last name of the user.
  apellidoUsuario!: string;

  @Column({ name: 'cedula_usuario', type: 'varchar', length: 255 })
  // National or personal identification number as string.
  cedulaUsuario!: string;

  @Column({ name: 'nickname_usuario', type: 'varchar', length: 255, nullable: true })
  // Optional nickname or alias for the user.
  nicknameUsuario!: string | null;

  @Column({ name: 'correo_usuario', type: 'varchar', length: 255 })
  // Email address used as a unique login identifier.
  correoUsuario!: string;

  @Column({ name: 'contrasena_usuario', type: 'varchar', length: 255 })
  // Hashed password of the user.
  contrasenaUsuario!: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 500, nullable: true })
  // Hash of the latest valid refresh token associated with the user.
  refreshTokenHash!: string | null;

  @Column({ name: 'token_version', type: 'int', default: 0 })
  // Version number used to invalidate previously issued refresh tokens.
  tokenVersion!: number;

  // --------- Relations ---------

  @ManyToOne(() => Rol, (r) => r.usuarios, { eager: true })
  @JoinColumn({ name: 'cod_rol', referencedColumnName: 'codRol' })
  // Role assigned to the user.
  rol!: Rol;

  // Exposes the role relation id without duplicating the underlying column.
  @RelationId((usuario: Usuario) => usuario.rol)
  codRol!: number;
}
