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
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  @Column({ name: 'nombre_usuario', type: 'varchar', length: 255 })
  nombreUsuario!: string;

  @Column({ name: 'apellido_usuario', type: 'varchar', length: 255 })
  apellidoUsuario!: string;

  @Column({ name: 'cedula_usuario', type: 'varchar', length: 255 })
  cedulaUsuario!: string;

  @Column({ name: 'nickname_usuario', type: 'varchar', length: 255, nullable: true })
  nicknameUsuario!: string | null;

  @Column({ name: 'correo_usuario', type: 'varchar', length: 255 })
  correoUsuario!: string;

  @Column({ name: 'contrasena_usuario', type: 'varchar', length: 255 })
  contrasenaUsuario!: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 500, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion!: number;

  // --------- Relaciones ---------

  @ManyToOne(() => Rol, (r) => r.usuarios, { eager: true })
  @JoinColumn({ name: 'cod_rol', referencedColumnName: 'codRol' })
  rol!: Rol;

  //expone el id de la relación sin duplicar columnas
  @RelationId((usuario: Usuario) => usuario.rol)
  codRol!: number;
}
