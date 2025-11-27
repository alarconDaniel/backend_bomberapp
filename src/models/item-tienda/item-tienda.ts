import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemInventario } from "../item_inventario/item_inventario";
import { Slot } from '../../common/slots.enum';

@Entity("items_tienda")
export class ItemTienda {

    // PK de la tienda, ej: 1 = Protector de racha, 2 = Tiempo extra...
    @PrimaryGeneratedColumn({ name: "cod_item" })
    codItem: number;

    // Nombre visible del ítem en la tienda (ej: "Protector de racha", "Cofre grande")
    @Column({ name: "nombre_item" })
    nombreItem: string;

    // Descripción corta / marketing del ítem (texto que ve el usuario en la ficha)
    // OJO: el nombre de la propiedad está mal escrito a propósito (desripcionItem) para no romper nada.
    @Column({ name: "descripcion_item" })
    desripcionItem: string;

    // Precio en monedas del juego (ej: 10, 40, 250, 1000)
    @Column({ name: "precio_item" })
    precioItem: number;

    /**
     * Tipo de ítem:
     * - "potenciador" → booster de gameplay (protector de racha, tiempo extra, x2, 50/50, Phoenix)
     * - "cofre"       → cofres aleatorios (pequeño, medio, grande)
     * - "ropa"        → cosméticos para el avatar (chaqueta, casco, falda, zapatos, etc.)
     *
     * Se usa para filtrar y organizar la tienda.
     */
    @Column({ name: "tipo_item" })
    tipoItem: string;

    // @Column({ name: "metadata_item" })
    // metadataItem: JSON;

    // Slot cosmético del avatar al que aplica cuando tipo_item = 'ropa' (cabeza, torso, piernas, pies, extra); null para cofres/potenciadores.
    @Column({ name: 'slot_item', type: 'enum', enum: Slot, nullable: true })
    slotItem: Slot | null;

    // Nombre del archivo de icono que usa el frontend (ej: 'protector-de-racha.png', 'cofre-grande.png', 'converce')
    @Column({ name: "icono_item" })
    iconoItem: string;

    // Relación 1..N con items_inventario: cuántos usuarios tienen este ítem comprado/poseído.
    @OneToMany(() => ItemInventario, (ii) => ii.item)
    itemsInventario: ItemInventario[];

}



