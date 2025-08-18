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

    public async verReto(cod: number): Promise<any>{
        return await this.retoRepository.findOne({where: {codReto: cod}})
    }

}
