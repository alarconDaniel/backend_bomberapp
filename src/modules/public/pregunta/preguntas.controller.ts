import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PreguntasService } from './preguntas.service';
import { CreatePreguntaDto } from './dto/create-pregunta.dto';
import { UpdatePreguntaDto } from './dto/update-pregunta.dto';

@ApiTags('Preguntas')
@ApiBearerAuth('access-token') 
@Controller('preguntas')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PreguntasController {
  constructor(private readonly service: PreguntasService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva pregunta',
    description:
      'Crea una pregunta asociada a un reto. Si no se envía numeroPregunta, el servicio calcula el siguiente orden disponible dentro del reto.',
  })
  @ApiResponse({ status: 201, description: 'Pregunta creada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o reto inexistente.' })
  create(@Body() dto: CreatePreguntaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar preguntas por reto',
    description: 'Devuelve todas las preguntas asociadas a un reto, en su orden actual.',
  })
  @ApiQuery({ name: 'codReto', type: Number, required: true, description: 'ID del reto al que pertenecen las preguntas.' })
  @ApiResponse({ status: 200, description: 'Listado de preguntas del reto.' })
  listByReto(@Query('codReto', ParseIntPipe) codReto: number) {
    return this.service.findAllByReto(codReto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de una pregunta',
    description: 'Devuelve la información de una pregunta por su ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la pregunta.' })
  @ApiResponse({ status: 200, description: 'Pregunta encontrada.' })
  @ApiResponse({ status: 404, description: 'Pregunta no encontrada.' })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una pregunta',
    description:
      'Actualiza parcialmente los datos de una pregunta existente (enunciado, puntos, tiempo, etc.).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la pregunta a actualizar.' })
  @ApiResponse({ status: 200, description: 'Pregunta actualizada correctamente.' })
  @ApiResponse({ status: 404, description: 'Pregunta no encontrada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePreguntaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una pregunta',
    description: 'Elimina una pregunta por su ID dentro del reto.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la pregunta a eliminar.' })
  @ApiResponse({ status: 200, description: 'Pregunta eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Pregunta no encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post('swap-orden')
  @ApiOperation({
    summary: 'Intercambiar orden de preguntas',
    description:
      'Intercambia el orden (numeroPregunta) de dos preguntas dentro del mismo reto, indicado por sus posiciones A y B.',
  })
  @ApiQuery({ name: 'codReto', type: Number, required: true, description: 'ID del reto donde se hace el intercambio.' })
  @ApiQuery({ name: 'a', type: Number, required: true, description: 'Posición (numeroPregunta) de la primera pregunta.' })
  @ApiQuery({ name: 'b', type: Number, required: true, description: 'Posición (numeroPregunta) de la segunda pregunta.' })
  @ApiResponse({ status: 200, description: 'Orden de preguntas intercambiado correctamente.' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos o posiciones fuera de rango.' })
  swap(
    @Query('codReto', ParseIntPipe) codReto: number,
    @Query('a', ParseIntPipe) a: number,
    @Query('b', ParseIntPipe) b: number,
  ) {
    return this.service.swapOrden(codReto, a, b);
  }
}
