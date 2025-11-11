// src/models/auditoria_trofeo/auditoria-trofeo.ts
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Trofeo } from '../trofeo/trofeo';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'auditoria_trofeos' })
export class AuditoriaTrofeo {
  @PrimaryGeneratedColumn({ name: 'cod_auditoria', type: 'int' })
  codAuditoria!: number;

  @ManyToOne(() => Trofeo, { eager: true })
  @JoinColumn({ name: 'cod_trofeo', referencedColumnName: 'codTrofeo' })
  trofeo!: Trofeo;

  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'prev_cod_usuario', referencedColumnName: 'codUsuario' })
  prevUsuario!: Usuario | null;

  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'nuevo_cod_usuario', referencedColumnName: 'codUsuario' })
  newUsuario!: Usuario | null;

  @CreateDateColumn({ name: 'cambiado_en', type: 'datetime' })
  cambiadoEn!: Date;

  @Column({ name: 'motivo_auditoria', type: 'varchar', length: 255 })
  motivo!: string;

  @Column({ name: 'metricas_auditoria', type: 'json', nullable: true })
  metricas!: any | null;
}
