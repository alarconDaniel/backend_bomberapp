import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("retos")
export class Reto {

  @PrimaryGeneratedColumn({ name: "cod_reto", type: "integer" })
  public codReto: number;

  @Column({ name: "nombre_reto", type: "varchar", length: 250, nullable: false })
  public nombreReto: string;

  @Column({ name: "descripcion_reto", type: "varchar", length: 1000, nullable: true })
  public descripcionReto: string | null;

  @Column({ name: "tiempo_reto", type: "integer", nullable: true })
  public tiempoReto: number | null;


  @Column({ name: "fecha_inicio_reto", type: "date", nullable: true })
  public fechaInicioReto: Date | null;

  @Column({ name: "fecha_fin_reto", type: "date", nullable: true })
  public fechaFinReto: Date | null;

  constructor(
    cod?: number,
    nombre?: string,
    descripcion?: string | null,
    tiempo?: number | null,
    fechaInicio?: Date | null,
    fechaFin?: Date | null,
  ) {
    if (cod !== undefined) this.codReto = cod;
    if (nombre !== undefined) this.nombreReto = nombre;
    this.descripcionReto = descripcion ?? null;
    this.tiempoReto = tiempo ?? null;
    this.fechaInicioReto = fechaInicio ?? null;
    this.fechaFinReto = fechaFin ?? null;
  }
}
