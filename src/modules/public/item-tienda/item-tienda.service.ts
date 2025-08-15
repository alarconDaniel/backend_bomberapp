import { Injectable } from '@nestjs/common';
import { ItemTienda } from 'src/models/item-tienda/item-tienda';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ItemTiendaService {

    private itemTiendaRepository: Repository<ItemTienda>

    constructor(private poolConexion: DataSource){
        this.itemTiendaRepository = poolConexion.getRepository(ItemTienda);
    }

    public async listarObjetos(): Promise<any>{
        return await this.itemTiendaRepository.find();
    }

}
