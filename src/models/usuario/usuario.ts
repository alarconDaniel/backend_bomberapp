// src/models/usuario/usuario.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';


@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  // Parte de la PK compuesta (PRIMARY KEY (cod_usuario, cod_rol))
  @PrimaryColumn({ name: 'cod_rol', type: 'int' })
  codRol!: number;

  @Column({ name: 'nombre_usuario', type: 'varchar', length: 255 })
  nombreUsuario!: string;

  @Column({ name: 'apellido_usuario', type: 'varchar', length: 255 })
  apellidoUsuario!: string;

  @Column({ name: 'nickname_usuario', type: 'varchar', length: 255, nullable: true })
  nicknameUsuario!: string | null;

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
