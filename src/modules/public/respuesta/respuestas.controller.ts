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
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Endpoints para registrar y consultar respuestas de preguntas y formularios.
 * Aplica validación global de DTOs con ValidationPipe.
 */
@ApiTags('Respuestas')
@ApiBearerAuth('access-token') 
@Controller('respuestas')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class RespuestasController {
  constructor(private readonly service: RespuestasService) {}

  // ---------- Preguntas ----------

  @Post('pregunta')
  @ApiOperation({ summary: 'Registrar respuesta a una pregunta de quiz' })
  @ApiCreatedResponse({ description: 'Respuesta a pregunta registrada correctamente.' })
  @ApiBody({ type: CreateRespuestaPreguntaDto })
  createRespuestaPregunta(@Body() dto: CreateRespuestaPreguntaDto) {
    return this.service.crearRespuestaPregunta(dto);
  }

  @Get('pregunta')
  @ApiOperation({ summary: 'Listar respuestas de preguntas por usuario-reto' })
  @ApiQuery({
    name: 'codUsuarioReto',
    type: Number,
    description: 'Identificador de la relación usuario-reto.',
    example: 12,
  })
  @ApiOkResponse({ description: 'Listado de respuestas de preguntas para ese usuario-reto.' })
  listRespuestasPregunta(@Query('codUsuarioReto', ParseIntPipe) codUsuarioReto: number) {
    return this.service.getRespuestasPreguntaByUsuarioReto(codUsuarioReto);
  }

  // ---------- Formularios ----------

  @Post('formulario')
  @ApiOperation({ summary: 'Registrar respuesta de formulario' })
  @ApiCreatedResponse({ description: 'Respuesta de formulario registrada correctamente.' })
  @ApiBody({ type: CreateRespuestaFormularioDto })
  createRespuestaFormulario(@Body() dto: CreateRespuestaFormularioDto) {
    return this.service.crearRespuestaFormulario(dto);
  }

  @Get('formulario/:id')
  @ApiOperation({ summary: 'Obtener una respuesta de formulario por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador de la respuesta de formulario.',
    example: 5,
  })
  @ApiOkResponse({ description: 'Detalle de una respuesta de formulario.' })
  getRespuestaFormulario(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRespuestaFormulario(id);
  }

  @Get('formulario')
  @ApiOperation({ summary: 'Listar respuestas de formulario por reto' })
  @ApiQuery({
    name: 'codReto',
    type: Number,
    description: 'Identificador del reto al que pertenecen los formularios.',
    example: 3,
  })
  @ApiOkResponse({ description: 'Listado de respuestas de formularios para el reto dado.' })
  listRespuestasFormulario(@Query('codReto', ParseIntPipe) codReto: number) {
    return this.service.getRespuestasFormularioByReto(codReto);
  }
}
