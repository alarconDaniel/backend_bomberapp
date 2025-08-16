// src/db/entities/Usuario.ts
import {
  Column, Entity, ManyToOne, JoinColumn,
  PrimaryGeneratedColumn, PrimaryColumn, Index
} from 'typeorm';
import { Rol } from '../rol/rol';

@Entity({ name: 'usuarios' })
@Index('fk_usuarios_roles1_idx', ['codRol'])
export class Usuario {
  // Parte 1 de PK (AUTO_INCREMENT)
  @PrimaryGeneratedColumn({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  // Parte 2 de PK (compuesta con cod_usuario)
  @PrimaryColumn({ name: 'cod_rol', type: 'int' })
  codRol!: number;

  @Column({ name: 'nombre_usuario', type: 'varchar', length: 255 })
  nombreUsuario!: string;

  @Column({ name: 'apellido_usuario', type: 'varchar', length: 255 })
  apellidoUsuario!: string;

  @Column({ name: 'correo_usuario', type: 'varchar', length: 255 })
  correoUsuario!: string; // **no** es único en tu SQL; yo pondría un índice único.

  @Column({ name: 'contrasena_usuario', type: 'varchar', length: 255 })
  contrasenaUsuario!: string;

  @Column({ name: 'cargo_usuario', type: 'varchar', length: 255 })
  cargoUsuario!: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 500, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion!: number;

  @ManyToOne(() => Rol, (r) => r.usuarios, { eager: true })
  @JoinColumn({ name: 'cod_rol', referencedColumnName: 'codRol' })
  rol!: Rol;
}
