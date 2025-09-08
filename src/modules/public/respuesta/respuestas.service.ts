import { RespuestaFormularioUsuario } from './../../../models/respuesta/RespuestaFormularioUsuario';
import { RespuestaPreguntaUsuario } from './../../../models/respuesta/RespuestaPreguntaUsuario';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRespuestaPreguntaDto } from './dto/create-respuesta-pregunta.dto';
import { CreateRespuestaFormularioDto } from './dto/create-respuesta-formulario.dto';

@Injectable()
export class RespuestasService {
  constructor(
    @InjectRepository(RespuestaPreguntaUsuario)
    private readonly repoPreg: Repository<RespuestaPreguntaUsuario>,

    @InjectRepository(RespuestaFormularioUsuario)
    private readonly repoForm: Repository<RespuestaFormularioUsuario>,
  ) {}

  // ---------------- Preguntas individuales ----------------
  async crearRespuestaPregunta(dto: CreateRespuestaPreguntaDto) {
    const entity = this.repoPreg.create({
      codUsuarioReto: dto.codUsuarioReto,
      codPregunta: dto.codPregunta,
      valorJson: dto.valorJson,
      esCorrecta: dto.esCorrecta ?? null,
      puntaje: dto.puntaje ?? null,
      tiempoSeg: dto.tiempoSeg ?? null,
    });
    return this.repoPreg.save(entity);
  }

  getRespuestasPreguntaByUsuarioReto(codUsuarioReto: number) {
    return this.repoPreg.find({
      where: { codUsuarioReto },
      order: { respondidoEn: 'ASC' },
    });
  }

  // ---------------- Formularios completos ----------------
  async crearRespuestaFormulario(dto: CreateRespuestaFormularioDto) {
    const entity = this.repoForm.create({
      codUsuarioReto: dto.codUsuarioReto,
      codReto: dto.codReto,
      data: dto.data,
      terminadoEn: dto.terminadoEn ?? null,
    });
    return this.repoForm.save(entity);
  }

  getRespuestasFormularioByReto(codReto: number) {
    return this.repoForm.find({ where: { codReto } });
  }

  async getRespuestaFormulario(id: number) {
    const found = await this.repoForm.findOne({ where: { codRespuestaForm: id } });
    if (!found) throw new NotFoundException('Respuesta de formulario no encontrada');
    return found;
  }
}
