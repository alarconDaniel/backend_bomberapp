// src/db/entities/TokenReinicioContrasena.ts
import {
  Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, PrimaryColumn
} from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'tokens_reinicio_contrasena' })
@Index('fk_tokens_reinicio_contrasena_usuarios1_idx', ['codUsuario'])
export class TokenReinicioContrasena {
  @PrimaryGeneratedColumn({ name: 'cod_token', type: 'int' })
  codToken!: number;

  // Tu SQL define PK compuesta (cod_token, cod_usuario). TypeORM permite:
  @PrimaryColumn({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  @Column({ name: 'token', type: 'varchar', length: 255 })
  token!: string;

  @Column({ name: 'expiracion_token', type: 'datetime' })
  expiracionToken!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn([
    { name: 'cod_usuario', referencedColumnName: 'codUsuario' },
    // OJO: Usuario tiene PK compuesta; como no tenemos aquí cod_rol, la ref por PK compuesta no queda perfecta.
    // Para simplificar, esto lo usamos solo para joins por cod_usuario.
  ])
  usuario!: Usuario;
}
