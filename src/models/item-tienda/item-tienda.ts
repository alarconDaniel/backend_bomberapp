import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("items_tienda")
export class ItemTienda {

    @PrimaryGeneratedColumn({ name: "cod_item" })
    private codItem: number;

    @Column({ name: "nombre_item" })
    private nombreItem: string;

    @Column({ name: "descripcion_item" })
    private desripcionItem: string;

    @Column({ name: "precio_item" })
    private precioItem: number;

    @Column({ name: "tipo_item" })
    private tipoItem: string;

    // @Column({ name: "metadata_item" })
    // private metadataItem: JSON;
}
