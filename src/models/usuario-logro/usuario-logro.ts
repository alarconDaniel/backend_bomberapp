import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';
import { Logro } from '../logro/logro';

@Entity({ name: 'usuarios_logros' })
export class UsuarioLogro {
  @PrimaryGeneratedColumn({ name: 'cod_usuario_logro', type: 'int' })
  codUsuarioLogro!: number;

  @ManyToOne(() => Usuario, (u) => u.codUsuario, { eager: false })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  usuario!: Usuario;

  @ManyToOne(() => Logro, (l) => l.codLogro, { eager: true })
  @JoinColumn({ name: 'cod_logro', referencedColumnName: 'codLogro' })
  logro!: Logro;

  @Column({name: "fecha_obtencion_logro", type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaObtencionLogro: string;
}
