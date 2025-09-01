import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'google_tokens' })
@Unique(['codUsuario'])
export class GoogleToken {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id!: number;

  @Column({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken!: string | null;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken!: string | null;

  @Column({ name: 'scope', type: 'text', nullable: true })
  scope!: string | null;

  @Column({ name: 'token_type', type: 'varchar', length: 32, nullable: true })
  tokenType!: string | null;

  @Column({ name: 'expiry_date', type: 'bigint', nullable: true })
  expiryDate!: number | null;
}
