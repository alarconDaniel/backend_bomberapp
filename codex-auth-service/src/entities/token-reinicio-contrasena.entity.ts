import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity({ name: 'auth_tokens_reinicio_contrasena' })
@Index('IDX_auth_token_usuario', ['token', 'userId'], { unique: true })
export class TokenReinicioContrasena {
  @PrimaryGeneratedColumn('uuid', { name: 'cod_token' })
  id!: string;

  @Column({ name: 'cod_usuario', type: 'int' })
  userId!: number;

  @Column({ name: 'token', type: 'varchar', length: 255 })
  token!: string;

  @Column({ name: 'expira_en', type: 'datetime' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'creado_en', type: 'datetime' })
  createdAt!: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'id' })
  usuario!: Usuario;
}
