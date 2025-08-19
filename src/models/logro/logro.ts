import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'logros' })
export class Logro {
  @PrimaryGeneratedColumn({ name: 'cod_logro', type: 'int' })
  codLogro!: number;

  @Column({ name: 'nombre_logro', type: 'varchar', length: 255 })
  nombreLogro!: string;

  @Column({ name: 'descripcion_logro', type: 'mediumtext' })
  descripcionLogro!: string;

  @Column({ name: 'icono_logro', type: 'varchar', length: 255 })
  iconoLogro!: string;

  @Column({ name: 'recompensa_logro', type: 'varchar', length: 255 })
  recompensaLogro!: string;

  @Column({ name: 'fecha_obtencion_logro', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaObtencionLogro!: Date;
}
