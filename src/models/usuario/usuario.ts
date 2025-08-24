// src/models/usuario/usuario.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  Index,
} from 'typeorm';
import { Archivo } from '../archivo/archivo';


@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  // ❗️Antes era parte de la PK compuesta. La pasamos a columna normal.
  // Si luego haces relación a 'roles', usa FK aquí o migra a tabla puente.
  @Column({ name: 'cod_rol', type: 'int', nullable: false, default: 1 })
  codRol!: number;

  @Column({ name: 'nombre_usuario', type: 'varchar', length: 255 })
  nombreUsuario!: string;

  @Column({ name: 'apellido_usuario', type: 'varchar', length: 255 })
  apellidoUsuario!: string;

  @Column({ name: 'nickname_usuario', type: 'varchar', length: 255, nullable: true })
  nicknameUsuario!: string | null;

  @Index('UQ_usuarios_correo', { unique: true })
  @Column({ name: 'correo_usuario', type: 'varchar', length: 255, unique: true })
  correoUsuario!: string;

  @Column({ name: 'contrasena_usuario', type: 'varchar', length: 255 })
  contrasenaUsuario!: string;

  @Column({ name: 'cedula_usuario', type: 'varchar', length: 45 })
  cedulaUsuario!: string;

  @Column({ name: 'cod_cargo_usuario', type: 'int', nullable: true })
  codCargoUsuario!: number | null;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 500, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion!: number;

  // 🔗 Relación 1:N con archivos
  @OneToMany(() => Archivo, (archivo) => archivo.usuario)
  archivos!: Archivo[];

  // ---------- Normalización ----------
  @BeforeInsert()
  @BeforeUpdate()
  private normalizarCampos() {
    if (this.correoUsuario) this.correoUsuario = this.correoUsuario.trim().toLowerCase();
    if (this.nicknameUsuario !== undefined && this.nicknameUsuario !== null) {
      this.nicknameUsuario = this.nicknameUsuario.trim();
    }
    if (this.nombreUsuario) this.nombreUsuario = this.nombreUsuario.trim();
    if (this.apellidoUsuario) this.apellidoUsuario = this.apellidoUsuario.trim();
  }
}
