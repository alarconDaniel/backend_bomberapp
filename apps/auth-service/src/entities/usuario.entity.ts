import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'auth_usuarios' })
@Index('IDX_auth_usuario_email', ['email'], { unique: true })
export class Usuario {
  @PrimaryColumn({ name: 'cod_usuario', type: 'int' })
  id!: number;

  @Column({ name: 'correo', type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 500, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion!: number;

  @Column({ name: 'ultimo_inicio_sesion', type: 'datetime', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetime' })
  updatedAt!: Date;
}
