import { Injectable } from '@nestjs/common';
import { Reto } from 'src/models/reto/reto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RetoService {

    private retoRepository: Repository<Reto>

    constructor(private poolConexion: DataSource){
        this.retoRepository = poolConexion.getRepository(Reto);
    }

    public async listarRetos(): Promise<any>{
        return await this.retoRepository.find();
    }

}
