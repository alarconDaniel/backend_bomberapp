import {
  Column, Entity, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn,
  BeforeInsert, BeforeUpdate
} from 'typeorm';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  @Column({ name: 'nombre_usuario', type: 'varchar', length: 255 })
  nombreUsuario!: string;

  @Column({ name: 'apellido_usuario', type: 'varchar', length: 255 })
  apellidoUsuario!: string;

  @Column({ name: 'cedula_usuario', type: 'varchar', length: 255, unique: true })
  cedulaUsuario!: string;

  @Column({ name: 'nickname_usuario', type: 'varchar', length: 255, unique: true })
  nicknameUsuario!: string;

  @Column({ name: 'correo_usuario', type: 'varchar', length: 255, unique: true })
  correoUsuario!: string;

  @Column({ name: 'contrasena_usuario', type: 'varchar', length: 255 })
  contrasenaUsuario!: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 500, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion!: number;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn!: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  actualizadoEn!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  private normalizarCampos() {
    if (this.correoUsuario) this.correoUsuario = this.correoUsuario.trim().toLowerCase();
    if (this.nicknameUsuario) this.nicknameUsuario = this.nicknameUsuario.trim();
    if (this.nombreUsuario) this.nombreUsuario = this.nombreUsuario.trim();
    if (this.apellidoUsuario) this.apellidoUsuario = this.apellidoUsuario.trim();
  }

  // Si ya tienes la entidad Archivo y la FK en la BD:
  // @OneToMany(() => Archivo, (a) => a.usuario)
  // archivos!: Archivo[];
}
