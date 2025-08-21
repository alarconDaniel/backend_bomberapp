import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { EstadisticaUsuarioModule } from '../estadistica-usuario/estadistica-usuario.module';
import { TrofeoModule } from '../trofeo/trofeo.module';

@Module({
  imports: [ConexionModule, UsuarioModule, EstadisticaUsuarioModule, TrofeoModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
