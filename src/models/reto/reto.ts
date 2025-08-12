import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("retos")
export class Reto {

    @PrimaryGeneratedColumn({name:"cod_reto"})
    private codReto: number;

    @Column({name: "nombre_reto"})
    private nombreReto: string;

    @Column({name: "descripcion_reto"})
    private descripcionReto: string;
    
    @Column({name: "tiempo_reto"})
    private tiempoReto: number;
    
    @Column({name: "fecha_inicio_reto"})
    private fechaInicioReto: Date;

    @Column({name: "fecha_fin_reto"})
    private fechaFinReto: Date;

}
