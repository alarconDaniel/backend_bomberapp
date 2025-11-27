import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { ArchivoService } from './archivo.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
 @ApiBearerAuth('access-token') 
@ApiTags('Archivos') // Agrupa los endpoints en Swagger bajo "Archivos"
@Controller('archivos')
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) {}

  /**
   * Obtiene el codUsuario a partir del JWT o de un override explícito.
   * Valida que el id sea numérico y mayor que cero.
   */
  private getCodUsuario(req: Request, override?: number | string) {
    const fromOverride = override !== undefined && override !== null ? Number(override) : undefined;
    const user: any = (req as any).user;
    const fromJwt = Number(user?.sub ?? user?.codUsuario ?? NaN);
    const codUsuario = Number.isFinite(fromOverride!) ? fromOverride! : fromJwt;

    if (!Number.isFinite(codUsuario) || codUsuario <= 0) {
      throw new BadRequestException('Usuario no identificado (codUsuario inválido).');
    }
    return codUsuario;
  }

  /**
   * Lee un parámetro desde body o query (body tiene prioridad).
   * Útil para campos que pueden venir en ambos sitios.
   */
  private getParam<T = string>(req: Request, key: string): T | undefined {
    const b = (req as any).body?.[key];
    const q = (req as any).query?.[key];
    return b !== undefined && b !== null && b !== '' ? b : q;
  }

  // Mantengo el endpoint para diagnóstico, pero ahora es "ping storage"
  @Get('ping-drive')
  @ApiOperation({
    summary: 'Ping de almacenamiento',
    description:
      'Verifica si el almacenamiento S3/MinIO es accesible para el usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado del ping al storage.',
  })
  async pingStorage(@Req() req: Request) {
    const codUsuario = this.getCodUsuario(req);
    try {
      await this.archivoService.listar({ codUsuario, take: 1, skip: 0 });
      return { ok: true, note: 'S3/MinIO accesible para este usuario.' };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  }

  @Get('listar')
  @ApiOperation({
    summary: 'Listar archivos del usuario',
    description:
      'Devuelve los archivos registrados para un usuario, con paginación básica (take/skip).',
  })
  @ApiQuery({
    name: 'codUsuario',
    required: false,
    description:
      'Id de usuario a consultar. Si no se envía, se toma del JWT.',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Cantidad de registros a devolver (máximo 100).',
    schema: { type: 'integer', default: 20 },
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Cantidad de registros a omitir para paginación.',
    schema: { type: 'integer', default: 0 },
  })
  async listarArchivos(
    @Req() req: Request,
    @Query('codUsuario') codUsuarioRaw?: string,
    @Query('take') takeRaw?: string,
    @Query('skip') skipRaw?: string,
  ) {
    const take = Math.min(Number(takeRaw ?? 20), 100);
    const skip = Number(skipRaw ?? 0);
    const codUsuario = this.getCodUsuario(req, codUsuarioRaw);
    return this.archivoService.listar({ codUsuario, take, skip });
  }

  // (Opcional) si en tu UI sigues llamando listar-por-tipo, ahora usa S3 por prefijo
  @Get('listar-por-tipo')
  @ApiOperation({
    summary: 'Listar archivos por tipo lógico',
    description:
      'Lista archivos filtrados por tipo lógico (mantenimiento o supervisión) usando prefijos en S3.',
  })
  @ApiQuery({
    name: 'tipo',
    required: true,
    description: 'Tipo de archivo lógico.',
    enum: ['mantenimiento', 'supervision'],
  })
  @ApiQuery({
    name: 'pageToken',
    required: false,
    description:
      'Token de paginación devuelto por una llamada anterior (si aplica).',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Cantidad de elementos por página (máximo 100).',
    schema: { type: 'integer', default: 20 },
  })
  async listarPorTipo(
    @Req() req: Request,
    @Query('tipo') tipo: 'mantenimiento' | 'supervision',
    @Query('pageToken') pageToken?: string,
    @Query('pageSize') pageSizeRaw?: string,
  ) {
    if (!tipo) throw new BadRequestException('tipo requerido (mantenimiento | supervision)');
    const codUsuario = this.getCodUsuario(req);
    const pageSize = Math.min(Number(pageSizeRaw ?? 20), 100);
    return this.archivoService.listarPorTipoS3(codUsuario, tipo, pageToken, pageSize);
  }

  @Get('url-descarga')
  @ApiOperation({
    summary: 'Generar URL firmada de descarga',
    description:
      'Genera una URL temporal firmada para descargar un archivo a partir de su path en S3.',
  })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Ruta completa del archivo en el storage (S3/MinIO).',
  })
  async generarUrlDescarga(@Query('path') path: string) {
    if (!path) throw new BadRequestException('path requerido');
    const url = await this.archivoService.obtenerUrlDescargaFirmada(path);
    return { url };
  }

  @Post('confirmar-tamano')
  @ApiOperation({
    summary: 'Confirmar tamaño tras subida',
    description:
      'Confirma el tamaño del archivo almacenado en S3 y actualiza el registro en BD.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Ruta completa del archivo en el storage (S3/MinIO).',
        },
      },
      required: ['path'],
    },
  })
  async confirmarTamano(@Body('path') path: string) {
    if (!path) throw new BadRequestException('path requerido');
    return this.archivoService.actualizarTamanoTrasSubida(path);
  }

  // SUBIR: multipart → el backend sube a S3 y registra en BD
  // Ejemplos:
  // POST /archivos/subir?tipo=mantenimiento&overwrite=true
  // POST /archivos/subir?carpeta=reportes&name=TerceraEntrega.pdf
  @Post('subir')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB (ajusta)
    }),
  )
  @ApiOperation({
    summary: 'Subir archivo al storage',
    description:
      'Recibe un archivo vía multipart/form-data, lo guarda en S3/MinIO y registra su metadata en la base de datos.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Payload de subida de archivo.',
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir.',
        },
        codUsuario: {
          type: 'integer',
          nullable: true,
          description:
            'Id de usuario al que se asocia el archivo. Si se omite, se usa el usuario del JWT.',
        },
        tipo: {
          type: 'string',
          nullable: true,
          description: 'Tipo lógico del archivo (mantenimiento | supervision).',
          enum: ['mantenimiento', 'supervision'],
        },
        carpeta: {
          type: 'string',
          nullable: true,
          description: 'Subcarpeta lógica dentro del bucket/prefijo.',
        },
        name: {
          type: 'string',
          nullable: true,
          description: 'Nombre de archivo destino (si no se envía, se genera).',
        },
        overwrite: {
          type: 'string',
          nullable: true,
          description:
            'Indica si se permite sobrescribir. Cualquier valor "false" (case-insensitive) desactiva overwrite.',
        },
      },
      required: ['archivo'],
    },
  })
  async subirArchivo(
    @Req() req: Request,
    @UploadedFile() archivo: Express.Multer.File,
    @Body('codUsuario') codUsuarioRaw?: string,
  ) {
    if (!archivo) throw new BadRequestException('archivo requerido');

    // Parámetros auxiliares: pueden venir de query o de body
    const tipo = this.getParam<'mantenimiento' | 'supervision'>(req, 'tipo');
    const carpeta = this.getParam<string>(req, 'carpeta'); // subcarpeta lógica
    const forceName = this.getParam<string>(req, 'name'); // nombre destino
    const overwriteRaw = this.getParam<string>(req, 'overwrite');
    const overwrite =
      overwriteRaw === undefined ? true : String(overwriteRaw).toLowerCase() !== 'false';

    const codUsuario = this.getCodUsuario(req, codUsuarioRaw);

    return this.archivoService.subirDesdeBackend(archivo, codUsuario, carpeta, tipo, {
      overwrite,
      forceName,
    });
  }

  @Delete('eliminar')
  @ApiOperation({
    summary: 'Eliminar archivo (DELETE)',
    description:
      'Elimina un archivo del storage y su registro en BD, validando que pertenezca al usuario.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codUsuario: {
          type: 'integer',
          nullable: true,
          description:
            'Id de usuario dueño del archivo. Si se omite, se toma del JWT.',
        },
        path: {
          type: 'string',
          description: 'Ruta completa del archivo a eliminar en el storage.',
        },
      },
      required: ['path'],
    },
  })
  async eliminarArchivo(
    @Req() req: Request,
    @Body() dto: { codUsuario?: number; path: string },
  ) {
    if (!dto?.path) throw new BadRequestException('Datos inválidos');
    const codUsuario = this.getCodUsuario(req, dto.codUsuario);
    return this.archivoService.eliminarPorPath(dto.path, codUsuario);
  }

  @Post('eliminar')
  @ApiOperation({
    summary: 'Eliminar archivo (POST)',
    description:
      'Alias del DELETE /archivos/eliminar para clientes que no pueden enviar cuerpos en DELETE.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codUsuario: {
          type: 'integer',
          nullable: true,
          description:
            'Id de usuario dueño del archivo. Si se omite, se toma del JWT.',
        },
        path: {
          type: 'string',
          description: 'Ruta completa del archivo a eliminar en el storage.',
        },
      },
      required: ['path'],
    },
  })
  async eliminarArchivoPost(
    @Req() req: Request,
    @Body() dto: { codUsuario?: number; path: string },
  ) {
    if (!dto?.path) throw new BadRequestException('Datos inválidos');
    const codUsuario = this.getCodUsuario(req, dto.codUsuario);
    return this.archivoService.eliminarPorPath(dto.path, codUsuario);
  }
}
