import { RespuestaPreguntaUsuario } from './../../../models/respuesta/RespuestaPreguntaUsuario';
import { RespuestaFormularioUsuario } from './../../../models/respuesta/RespuestaFormularioUsuario';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RespuestasService } from './respuestas.service';
import { RespuestasController } from './respuestas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RespuestaPreguntaUsuario, RespuestaFormularioUsuario])],
  controllers: [RespuestasController],
  providers: [RespuestasService],
  exports: [RespuestasService],
})
export class RespuestasModule {}
