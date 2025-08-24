import { Module } from '@nestjs/common';
import { RetoController } from './reto.controller';
import { RetoService } from './reto.service';
import { ConexionModule } from 'src/config/conexion/conexion.module'; // solo si NO @Global

@Module({
  imports: [ConexionModule], // ← solo si NO marcaste @Global
  controllers: [RetoController],
  providers: [RetoService],
})
export class RetoModule {}
