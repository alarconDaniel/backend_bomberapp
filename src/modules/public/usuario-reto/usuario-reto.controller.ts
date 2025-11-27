// src/modules/public/usuario-reto/usuario-reto.controller.ts
import {
  Controller,
  Get,
  Patch,
  Query,
  Body,
  UseGuards,
  Post,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UsuarioRetoService } from './usuario-reto.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@ApiTags('Mis Retos')
@ApiBearerAuth('access-token') 
@Controller('mis-retos')
export class UsuarioRetoController {
  constructor(private readonly srv: UsuarioRetoService) {}

  // Lista los retos asignados al usuario para un día concreto (HomeScreen).
  @Get('dia')
  @ApiOperation({
    summary: 'Listar retos del día',
    description:
      'Devuelve los retos asignados al usuario autenticado para la fecha indicada. Si no se envía fecha, usa la fecha actual.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha en formato YYYY-MM-DD. Si se omite, se toma la fecha actual.',
    example: '2025-02-10',
  })
  async dia(
    @CurrentUser() user: { sub: number },
    @Query('fecha') fecha?: string,
  ) {
    return this.srv.listarDia(user.sub, fecha);
  }

  // Lista retos del usuario filtrando por estado opcionalmente.
  @Get('listar')
  @ApiOperation({
    summary: 'Listar mis retos',
    description:
      'Lista los retos del usuario autenticado. Puede filtrarse por estado (asignado, en_progreso, completado, etc.).',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description:
      'Estado de los retos a filtrar. Si se omite, devuelve todos los estados.',
    enum: ['pendiente', 'asignado', 'en_progreso', 'completado', 'abandonado', 'vencido'],
  })
  async listar(
    @CurrentUser() user: { sub: number },
    @Query('estado')
    estado?:
      | 'pendiente'
      | 'asignado'
      | 'en_progreso'
      | 'completado'
      | 'abandonado'
      | 'vencido',
  ) {
    return this.srv.listarMisRetos(user.sub, estado);
  }

  // Resumen agregado de los retos del usuario (contadores/estadísticas).
  @Get('resumen')
  @ApiOperation({
    summary: 'Resumen de mis retos',
    description:
      'Devuelve un resumen de los retos del usuario (por ejemplo: cuántos pendientes, completados, etc.).',
  })
  async resumen(@CurrentUser() user: { sub: number }) {
    return this.srv.resumenMisRetos(user.sub);
  }

  // Cambia el estado de un reto asignado al usuario.
  @Patch('estado')
  @ApiOperation({
    summary: 'Cambiar estado de un reto',
    description:
      'Permite actualizar el estado de un reto asignado al usuario (asignado, en_progreso, completado, abandonado o vencido).',
  })
  @ApiBody({
    description: 'Datos para cambiar el estado de un reto del usuario.',
    schema: {
      type: 'object',
      required: ['codReto', 'estado'],
      properties: {
        codReto: {
          type: 'integer',
          example: 10,
          description: 'Código del reto asignado al usuario.',
        },
        estado: {
          type: 'string',
          enum: ['asignado', 'en_progreso', 'completado', 'abandonado', 'vencido'],
          example: 'en_progreso',
          description: 'Nuevo estado a aplicar al reto.',
        },
      },
    },
  })
  async cambiarEstado(
    @CurrentUser() user: { sub: number },
    @Body()
    body: {
      codReto: number;
      estado:
        | 'asignado'
        | 'en_progreso'
        | 'completado'
        | 'abandonado'
        | 'vencido';
    },
  ) {
    return this.srv.marcarEstado(user.sub, body.codReto, body.estado);
  }

  // Abre un reto (por ejemplo, para pasar de asignado a en_progreso).
  @Post('abrir')
  @ApiOperation({
    summary: 'Abrir un reto',
    description:
      'Marca un reto como abierto/iniciado para el usuario autenticado. Suele usarse antes de comenzar un quiz o formulario.',
  })
  @ApiBody({
    description: 'Datos del reto que se quiere abrir.',
    schema: {
      type: 'object',
      required: ['codReto'],
      properties: {
        codReto: {
          type: 'integer',
          example: 15,
          description: 'Código del reto a abrir.',
        },
      },
    },
  })
  async abrir(
    @CurrentUser() user: { sub: number },
    @Body() body: { codReto: number },
  ) {
    return this.srv.abrirReto(user.sub, body.codReto);
  }

  // Registra la respuesta de una pregunta de un quiz asociado al reto.
  @Post(':codUsuarioReto/quiz/responder')
  @ApiOperation({
    summary: 'Responder pregunta de quiz',
    description:
      'Registra la respuesta a una pregunta de un quiz para una asignación de reto concreta.',
  })
  @ApiParam({
    name: 'codUsuarioReto',
    description:
      'Identificador de la asignación usuario-reto (puede redundar con el que va en el body).',
    type: Number,
    example: 120,
  })
  @ApiBody({
    description: 'Datos de la respuesta a la pregunta del quiz.',
    schema: {
      type: 'object',
      required: ['codUsuarioReto', 'codPregunta', 'valor'],
      properties: {
        codUsuarioReto: {
          type: 'integer',
          example: 120,
          description: 'ID de la asignación usuario-reto.',
        },
        codPregunta: {
          type: 'integer',
          example: 7,
          description: 'Código de la pregunta que se responde.',
        },
        valor: {
          description: 'Respuesta del usuario (puede ser texto, opción, etc.).',
        },
        tiempoSeg: {
          type: 'integer',
          nullable: true,
          example: 12,
          description: 'Tiempo empleado en contestar la pregunta (en segundos).',
        },
      },
    },
  })
  async responderQuiz(
    @CurrentUser() user: { sub: number },
    @Body()
    body: {
      codUsuarioReto: number;
      codPregunta: number;
      valor: any;
      tiempoSeg?: number;
    },
  ) {
    return this.srv.responderQuiz(
      user.sub,
      body.codUsuarioReto,
      body.codPregunta,
      body.valor,
      body.tiempoSeg ?? null,
    );
  }

  // Envía un formulario completo asociado a un reto.
  @Post(':codUsuarioReto/form/enviar')
  @ApiOperation({
    summary: 'Enviar formulario de reto',
    description:
      'Registra las respuestas completas de un formulario asociado a un reto y a una asignación usuario-reto.',
  })
  @ApiParam({
    name: 'codUsuarioReto',
    description:
      'Identificador de la asignación usuario-reto (puede redundar con el que va en el body).',
    type: Number,
    example: 130,
  })
  @ApiBody({
    description: 'Datos del formulario a enviar.',
    schema: {
      type: 'object',
      required: ['codUsuarioReto', 'codReto', 'data'],
      properties: {
        codUsuarioReto: {
          type: 'integer',
          example: 130,
          description: 'ID de la asignación usuario-reto.',
        },
        codReto: {
          type: 'integer',
          example: 20,
          description: 'Código del reto al que pertenece el formulario.',
        },
        data: {
          type: 'object',
          description: 'Contenido del formulario en formato JSON.',
          example: {
            campo1: 'valor',
            campo2: 3,
            checkList: ['opA', 'opC'],
          },
        },
      },
    },
  })
  async enviarForm(
    @CurrentUser() user: { sub: number },
    @Body()
    body: { codUsuarioReto: number; codReto: number; data: any },
  ) {
    return this.srv.enviarFormulario(
      user.sub,
      body.codUsuarioReto,
      body.codReto,
      body.data,
    );
  }

  // Marca la asignación de reto como finalizada para el usuario.
  @Post(':codUsuarioReto/finalizar')
  @ApiOperation({
    summary: 'Finalizar reto',
    description:
      'Marca el reto del usuario como finalizado (por ejemplo, tras completar el quiz/formulario).',
  })
  @ApiParam({
    name: 'codUsuarioReto',
    description:
      'Identificador de la asignación usuario-reto (puede redundar con el que va en el body).',
    type: Number,
    example: 140,
  })
  @ApiBody({
    description: 'Identificador de la asignación usuario-reto a finalizar.',
    schema: {
      type: 'object',
      required: ['codUsuarioReto'],
      properties: {
        codUsuarioReto: {
          type: 'integer',
          example: 140,
          description: 'ID de la asignación usuario-reto a finalizar.',
        },
      },
    },
  })
  async finalizar(
    @CurrentUser() user: { sub: number },
    @Body() body: { codUsuarioReto: number },
  ) {
    return this.srv.finalizar(user.sub, body.codUsuarioReto);
  }

  // Usa un comodín del inventario del usuario sobre un reto/pregunta.
  @Post(':codUsuarioReto/comodines/usar')
  @ApiOperation({
    summary: 'Usar comodín sobre un reto',
    description:
      'Consume un comodín del inventario del usuario y aplica su efecto sobre un reto (opcionalmente sobre una pregunta concreta).',
  })
  @ApiParam({
    name: 'codUsuarioReto',
    type: Number,
    example: 200,
    description:
      'Identificador de la asignación usuario-reto sobre la que se aplica el comodín.',
  })
  @ApiBody({
    description:
      'Datos del comodín que se quiere usar y parámetros adicionales según el tipo.',
    schema: {
      type: 'object',
      required: ['tipo'],
      properties: {
        codUsuarioReto: {
          type: 'integer',
          nullable: true,
          example: 200,
          description:
            'ID de la asignación usuario-reto (si se omite, se toma el de la ruta).',
        },
        codPregunta: {
          type: 'integer',
          nullable: true,
          example: 5,
          description:
            'Código de la pregunta afectada por el comodín (si aplica, p.ej. 50/50).',
        },
        tipo: {
          type: 'string',
          enum: ['50/50', 'mas_tiempo', 'protector_racha', 'double', 'ave_fenix'],
          example: 'mas_tiempo',
          description: 'Tipo de comodín a utilizar.',
        },
        segundos: {
          type: 'integer',
          nullable: true,
          example: 30,
          description:
            'Cantidad de segundos adicionales (para comodines de tipo mas_tiempo).',
        },
        hasta: {
          type: 'string',
          nullable: true,
          example: '2025-02-10T12:00:00Z',
          description:
            'Fecha/hora límite de efecto del comodín, en formato ISO 8601 (si aplica).',
        },
      },
    },
  })
  async usarComodin(
    @CurrentUser() user: { sub: number },
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
    @Body()
    body: {
      codUsuarioReto?: number;
      codPregunta?: number | null;
      tipo: '50/50' | 'mas_tiempo' | 'protector_racha' | 'double' | 'ave_fenix';
      segundos?: number;
      hasta?: string;
    },
  ) {
    return this.srv.usarComodin(user.sub, codUsuarioReto, {
      codPregunta: body?.codPregunta ?? null,
      tipo: body.tipo,
      segundos: body?.segundos,
      hasta: body?.hasta,
    });
  }

  // Devuelve el banco de preguntas del reto asignado al usuario (para jugar el quiz).
  @Get(':codUsuarioReto/preguntas')
  @ApiOperation({
    summary: 'Obtener preguntas de un reto asignado',
    description:
      'Devuelve las preguntas asociadas a una asignación usuario-reto, listas para ser respondidas (quiz).',
  })
  @ApiParam({
    name: 'codUsuarioReto',
    type: Number,
    example: 210,
    description: 'Identificador de la asignación usuario-reto.',
  })
  async preguntas(
    @CurrentUser() user: { sub: number },
    @Param('codUsuarioReto', ParseIntPipe) codUsuarioReto: number,
  ) {
    return this.srv.preguntasDeUsuarioReto(user.sub, codUsuarioReto);
  }
}
