import { Module } from '@nestjs/common';
import { RetoController } from './reto.controller';
import { RetoService } from './reto.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  controllers: [RetoController],
  providers: [RetoService]
})
export class RetoModule {}
