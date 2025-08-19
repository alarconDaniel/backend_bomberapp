// src/db/entities/Usuario.ts
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { Rol } from '../rol/rol';
import { CargoUsuario } from '../cargo_usuario/cargo-usuario';
import { EstadisticaUsuario } from '../estadistica-usuario/estadistica-usuario';

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

  @Column({ name: 'nickname_usuario', type: 'varchar', length: 255 })
  nicknameUsuario!: string;

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

  @ManyToOne(() => CargoUsuario, (c) => c.usuarios, { eager: true, nullable: true })
  @JoinColumn({ name: 'cod_cargo_usuario', referencedColumnName: 'codCargoUsuario' })
  cargo!: CargoUsuario | null;

  @OneToOne(() => EstadisticaUsuario, (e) => e.usuario)
  estadisticas!: EstadisticaUsuario | null;
}
