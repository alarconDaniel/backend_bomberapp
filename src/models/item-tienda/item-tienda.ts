import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("items_tienda")
export class ItemTienda {

    @PrimaryGeneratedColumn({ name: "cod_item" })
    codItem: number;

    @Column({ name: "nombre_item" })
    nombreItem: string;

    @Column({ name: "descripcion_item" })
    desripcionItem: string;

    @Column({ name: "precio_item" })
    precioItem: number;

    @Column({ name: "tipo_item" })
    tipoItem: string;

    // @Column({ name: "metadata_item" })
    // metadataItem: JSON;
}
