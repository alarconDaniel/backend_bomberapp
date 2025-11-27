// src/db/entities/TokenReinicioContrasena.ts
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'tokens_reinicio_contrasena' })
@Index('fk_tokens_reinicio_contrasena_usuarios1_idx', ['codUsuario'])
export class TokenReinicioContrasena {
  /**
   * Identificador autoincremental del registro de token.
   * En la BD hace parte de la PK compuesta junto con cod_usuario.
   */
  @PrimaryGeneratedColumn({ name: 'cod_token', type: 'int' })
  codToken!: number;

  /**
   * Usuario al que pertenece el token.
   *
   * Según el esquema MySQL, la PK es compuesta (cod_token, cod_usuario).
   * Aquí se declara también como @PrimaryColumn para reflejar esa intención,
   * aunque en la práctica se usa sobre todo para búsquedas por usuario.
   */
  @PrimaryColumn({ name: 'cod_usuario', type: 'int' })
  codUsuario!: number;

  /**
   * Token de reinicio de contraseña (cadena opaca que se envía al usuario).
   */
  @Column({ name: 'token', type: 'varchar', length: 255 })
  token!: string;

  /**
   * Momento en que el token deja de ser válido.
   */
  @Column({ name: 'expiracion_token', type: 'datetime' })
  expiracionToken!: Date;

  /**
   * Relación muchos-a-uno con Usuario.
   *
   * Nota: Usuario usa PK compuesta, pero aquí solo se referencia por cod_usuario.
   * Es suficiente para joins prácticos, aunque no modela la PK compuesta completa.
   */
  @ManyToOne(() => Usuario)
  @JoinColumn([
    { name: 'cod_usuario', referencedColumnName: 'codUsuario' },
  ])
  usuario!: Usuario;
}
