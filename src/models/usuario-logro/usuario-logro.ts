import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';
import { Logro } from '../logro/logro';

/**
 * Relación entre usuarios y logros obtenidos.
 * Cada fila indica qué logro consiguió un usuario y en qué fecha.
 */
@Entity({ name: 'usuarios_logros' })
export class UsuarioLogro {
  /**
   * Identificador interno del registro de usuario–logro.
   */
  @PrimaryGeneratedColumn({ name: 'cod_usuario_logro', type: 'int' })
  codUsuarioLogro!: number;

  /**
   * Usuario que obtuvo el logro.
   */
  @ManyToOne(() => Usuario, (u) => u.codUsuario, { eager: false })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  usuario!: Usuario;

  /**
   * Logro asociado al usuario.
   * Se carga en eager para poder mostrar metadatos del logro directamente.
   */
  @ManyToOne(() => Logro, (l) => l.codLogro, { eager: true })
  @JoinColumn({ name: 'cod_logro', referencedColumnName: 'codLogro' })
  logro!: Logro;

  /**
   * Momento en el que el usuario obtuvo este logro.
   * Se inicializa por defecto con la fecha/hora actual.
   */
  @Column({
    name: 'fecha_obtencion_logro',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaObtencionLogro!: string;
}
