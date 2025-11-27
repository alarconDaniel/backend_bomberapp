// src/models/auditoria_trofeo/auditoria-trofeo.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trofeo } from '../trofeo/trofeo';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'auditoria_trofeos' })
// Registro histórico de cambios de propiedad / estado de un trofeo
export class AuditoriaTrofeo {
  @PrimaryGeneratedColumn({ name: 'cod_auditoria', type: 'int' })
  codAuditoria!: number;

  // Trofeo sobre el que se está registrando la auditoría
  @ManyToOne(() => Trofeo, { eager: true })
  @JoinColumn({ name: 'cod_trofeo', referencedColumnName: 'codTrofeo' })
  trofeo!: Trofeo;

  // Usuario que tenía el trofeo ANTES del cambio (puede ser null si no tenía dueño)
  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'prev_cod_usuario', referencedColumnName: 'codUsuario' })
  prevUsuario!: Usuario | null;

  // Usuario que tiene el trofeo DESPUÉS del cambio (puede ser null si se revoca)
  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'nuevo_cod_usuario', referencedColumnName: 'codUsuario' })
  newUsuario!: Usuario | null;

  // Momento exacto en el que se registró la auditoría
  @CreateDateColumn({ name: 'cambiado_en', type: 'datetime' })
  cambiadoEn!: Date;

  // Motivo humano-legible del cambio (ej: "corrección de bug", "asignación manual", etc.)
  @Column({ name: 'motivo_auditoria', type: 'varchar', length: 255 })
  motivo!: string;

  // Campo libre para guardar métricas o contexto extra (JSON)
  // Ej: { "fromRank": 3, "toRank": 1, "source": "cron-job" }
  @Column({ name: 'metricas_auditoria', type: 'json', nullable: true })
  metricas!: any | null;
}
