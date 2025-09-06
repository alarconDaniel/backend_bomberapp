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
  import { PreguntasService } from './preguntas.service';
  import { CreatePreguntaDto } from './dto/create-pregunta.dto';
  import { UpdatePreguntaDto } from './dto/update-pregunta.dto';
  
  @Controller('preguntas')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  export class PreguntasController {
    constructor(private readonly service: PreguntasService) {}
  
    @Post()
    create(@Body() dto: CreatePreguntaDto) {
      return this.service.create(dto);
    }
  
    @Get()
    listByReto(@Query('codReto', ParseIntPipe) codReto: number) {
      return this.service.findAllByReto(codReto);
    }
  
    @Get(':id')
    get(@Param('id', ParseIntPipe) id: number) {
      return this.service.findOne(id);
    }
  
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePreguntaDto) {
      return this.service.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.service.remove(id);
    }
  
    @Post('swap-orden')
    swap(
      @Query('codReto', ParseIntPipe) codReto: number,
      @Query('a', ParseIntPipe) a: number,
      @Query('b', ParseIntPipe) b: number,
    ) {
      return this.service.swapOrden(codReto, a, b);
    }
  }
  