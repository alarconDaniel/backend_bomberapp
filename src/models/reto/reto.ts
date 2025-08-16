// src/db/entities/Reto.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'retos' })
export class Reto {
  @PrimaryGeneratedColumn({ name: 'cod_reto', type: 'int' })
  codReto!: number;

  @Column({ name: 'nombre_reto', type: 'varchar', length: 255 })
  nombreReto!: string;

  @Column({ name: 'descripcion_reto', type: 'longtext' })
  descripcionReto!: string;

  @Column({ name: 'tiempo_estimado_seg_reto', type: 'int' })
  tiempoEstimadoSegReto!: number;

  @Column({ name: 'fecha_inicio_reto', type: 'date' })
  fechaInicioReto!: string; // o Date si prefieres, pero MySQL DATE sin hora se maneja cómodo como string 'YYYY-MM-DD'

  @Column({ name: 'fecha_fin_reto', type: 'date' })
  fechaFinReto!: string;
}
