import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemInventario } from "../item_inventario/item_inventario";

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

    @Column({name: "icono_item"})
    iconoItem:string;

    @OneToMany(() => ItemInventario, (ii) => ii.item)
    itemsInventario: ItemInventario[];

}
