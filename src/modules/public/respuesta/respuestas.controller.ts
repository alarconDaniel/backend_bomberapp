import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { RespuestasService } from './respuestas.service';
  import { CreateRespuestaPreguntaDto } from './dto/create-respuesta-pregunta.dto';
  import { CreateRespuestaFormularioDto } from './dto/create-respuesta-formulario.dto';
  
  @Controller('respuestas')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  export class RespuestasController {
    constructor(private readonly service: RespuestasService) {}
  
    // ---------- Preguntas ----------
    @Post('pregunta')
    createRespuestaPregunta(@Body() dto: CreateRespuestaPreguntaDto) {
      return this.service.crearRespuestaPregunta(dto);
    }
  
    @Get('pregunta')
    listRespuestasPregunta(@Query('codUsuarioReto', ParseIntPipe) codUsuarioReto: number) {
      return this.service.getRespuestasPreguntaByUsuarioReto(codUsuarioReto);
    }
  
    // ---------- Formularios ----------
    @Post('formulario')
    createRespuestaFormulario(@Body() dto: CreateRespuestaFormularioDto) {
      return this.service.crearRespuestaFormulario(dto);
    }
  
    @Get('formulario/:id')
    getRespuestaFormulario(@Param('id', ParseIntPipe) id: number) {
      return this.service.getRespuestaFormulario(id);
    }
  
    @Get('formulario')
    listRespuestasFormulario(@Query('codReto', ParseIntPipe) codReto: number) {
      return this.service.getRespuestasFormularioByReto(codReto);
    }
  }
  