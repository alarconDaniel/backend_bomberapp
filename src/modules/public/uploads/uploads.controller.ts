// src/modules/public/uploads/uploads.controller.ts
import {
  Controller,
  Get,
  Query,
  Delete,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { ArchivoService } from '../archivo/archivo.service';

type TipoArea = 'mantenimiento' | 'supervision';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token') 
@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploads: UploadsService,
    private readonly archivos: ArchivoService,
  ) {}

  // ───────────────── presign (PUT a MinIO) ─────────────────
  @Get('presign')
  @ApiOperation({
    summary: 'Generar URL firmada para subir un archivo a S3/MinIO',
    description:
      'Devuelve una URL temporal (PUT) para subir un archivo directamente al storage, asociada al usuario y tipo de área.',
  })
  @ApiQuery({ name: 'filename', description: 'Nombre original del archivo', type: String })
  @ApiQuery({ name: 'contentType', description: 'MIME type del archivo', type: String })
  @ApiQuery({ name: 'codUsuario', description: 'ID del usuario que sube el archivo', type: Number })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description: 'Área del archivo (mantenimiento | supervision)',
    enum: ['mantenimiento', 'supervision'],
  })
  @ApiOkResponse({
    description: 'URL firmada generada correctamente',
  })
  @ApiBadRequestResponse({
    description: 'Parámetros obligatorios ausentes o inválidos',
  })
  presign(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
    @Query('codUsuario') codUsuario: string,
    @Query('tipo') tipoRaw?: string,
  ) {
    if (!filename || !contentType || !codUsuario) {
      throw new BadRequestException('filename, contentType y codUsuario son requeridos');
    }

    // normaliza el tipo (solo aceptamos estos dos)
    const t = (tipoRaw || '').toLowerCase();
    const tipo: TipoArea | undefined =
      t === 'mantenimiento' || t === 'supervision' ? (t as TipoArea) : undefined;

    return this.uploads.createSignedUploadUrl({
      filename,
      contentType,
      codUsuario: Number(codUsuario),
      tipo,
    });
  }

  // ──────────────── listar (desde BD) ────────────────
  @Get('list')
  @ApiOperation({
    summary: 'Listar archivos registrados en BD',
    description:
      'Devuelve una lista paginada de archivos almacenados, filtrando opcionalmente por usuario.',
  })
  @ApiQuery({
    name: 'codUsuario',
    required: false,
    description: 'ID del usuario dueño de los archivos',
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Cantidad máxima de registros a devolver (máx. 100, por defecto 50)',
    type: Number,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Offset de paginación',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Listado de archivos con total y filas',
  })
  @ApiBadRequestResponse({
    description: 'Parámetros numéricos inválidos',
  })
  async list(
    @Query('codUsuario') codUsuario?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const cod =
      codUsuario !== undefined && codUsuario !== null && codUsuario !== ''
        ? Number(codUsuario)
        : undefined;
    if (codUsuario !== undefined && !Number.isFinite(cod!)) {
      throw new BadRequestException('codUsuario inválido');
    }
    const takeN = Math.min(Number(take ?? 50), 100);
    const skipN = Number(skip ?? 0);
    const { rows, total } = await this.archivos.listar({
      codUsuario: cod,
      take: takeN,
      skip: skipN,
    });
    return { total, rows };
  }

  // ──────────────── descarga firmada (GET temporal) ────────────────
  @Get('download-presign')
  @ApiOperation({
    summary: 'Generar URL firmada de descarga',
    description: 'Devuelve una URL temporal (GET) para descargar un archivo desde S3/MinIO.',
  })
  @ApiQuery({
    name: 'key',
    description: 'Clave (path) del objeto en el bucket',
    type: String,
  })
  @ApiOkResponse({
    description: 'URL firmada de descarga generada correctamente',
  })
  @ApiBadRequestResponse({
    description: 'key requerido o inválido',
  })
  async downloadPresign(@Query('key') key: string) {
    if (!key) throw new BadRequestException('key requerido');
    return this.uploads.createSignedDownloadUrl(key);
  }

  // ──────────────── borrar en MinIO + borrar SIEMPRE en BD ────────────────
  @Delete()
  @ApiOperation({
    summary: 'Eliminar archivo del storage y de la base de datos',
    description:
      'Elimina el objeto en S3/MinIO y borra el registro asociado en BD si existe, sin filtrar por usuario.',
  })
  @ApiQuery({
    name: 'key',
    description: 'Clave (path) del objeto a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Archivo eliminado (o intento realizado) correctamente',
  })
  @ApiBadRequestResponse({
    description: 'key requerido o inválido',
  })
  async remove(@Query('key') key: string) {
    if (!key) throw new BadRequestException('key requerido');

    // 1) S3 / MinIO
    await this.uploads.deleteObject(key);

    // 2) BD (sin filtrar por codUsuario)
    try {
      if (typeof (this.archivos as any).removeByKey === 'function') {
        await (this.archivos as any).removeByKey(key);
      } else {
        // fallback a eliminarPorPath SIN cod
        await (this.archivos as any).eliminarPorPath?.(key, undefined);
      }
    } catch {
      /* silencioso */
    }

    return { deleted: true, key };
  }

  @Post('complete')
  @ApiOperation({
    summary: 'Confirmar subida y registrar archivo en BD',
    description:
      'Se llama después de subir el archivo al storage para crear o actualizar el registro en la base de datos.',
  })
  @ApiBody({
    description: 'Datos de la subida completada',
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Clave (path) del objeto en el bucket' },
        filename: {
          type: 'string',
          nullable: true,
          description: 'Nombre original del archivo',
        },
        contentType: {
          type: 'string',
          nullable: true,
          description: 'MIME type del archivo',
        },
        size: {
          type: 'number',
          nullable: true,
          description: 'Tamaño del archivo en bytes',
        },
        etag: {
          type: 'string',
          nullable: true,
          description: 'ETag devuelto por el storage',
        },
        codUsuario: {
          type: 'number',
          nullable: true,
          description: 'ID del usuario dueño del archivo',
        },
        tipo: {
          type: 'string',
          nullable: true,
          description: 'Área del archivo (mantenimiento | supervision)',
          enum: ['mantenimiento', 'supervision'],
        },
      },
      required: ['key'],
    },
  })
  @ApiOkResponse({
    description: 'Archivo registrado/actualizado correctamente en base de datos',
  })
  @ApiBadRequestResponse({
    description: 'key ausente o payload inválido',
  })
  async complete(
    @Body()
    dto: {
      key: string;
      filename?: string;
      contentType?: string;
      size?: number;
      etag?: string | null;
      codUsuario?: number;
      tipo?: TipoArea; // opcional
    },
  ) {
    if (!dto?.key) throw new BadRequestException('key requerido');

    const t = (dto.tipo || '').toLowerCase();
    const area: TipoArea | null =
      t === 'mantenimiento' || t === 'supervision' ? (t as TipoArea) : null;

    const saved = await this.archivos.createOrUpdateS3Record({
      codUsuario: dto.codUsuario ?? null,
      bucket: process.env.S3_BUCKET!,
      keyPath: dto.key,
      nombreOriginal: dto.filename ?? dto.key.split('/').pop() ?? dto.key,
      tipoContenido: dto.contentType ?? 'application/octet-stream',
      tamanoBytes: dto.size ?? 0,
      storageEtag: dto.etag ?? null,
      area,
    });

    return { ok: true, archivo: saved };
  }

  @Get('file')
  @ApiOperation({
    summary: 'Descargar archivo como stream',
    description:
      'Obtiene el archivo desde S3/MinIO y lo envía como attachment, usando el nombre original si está disponible en BD.',
  })
  @ApiQuery({
    name: 'key',
    description: 'Clave (path) del objeto a descargar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Archivo streameado correctamente al cliente',
  })
  @ApiBadRequestResponse({
    description: 'key requerido o inválido',
  })
  async streamFile(@Query('key') key: string, @Res() res: Response) {
    if (!key) throw new BadRequestException('key requerido');

    // 1) Intenta obtener metadatos desde BD para el nombre legible
    let nombre = key.split('/').pop() || 'archivo';
    try {
      const rec =
        (await (this.archivos as any).archivoRepo.findOne({
          where: { keyPath: key } as any,
        })) ||
        (await (this.archivos as any).archivoRepo.findOne({
          where: { rutaArchivo: key } as any,
        }));
      if (rec?.nombreOriginal) nombre = String(rec.nombreOriginal);
    } catch {
      /* opcional: silencioso */
    }

    // 2) Pide el objeto a S3/MinIO
    const obj = await this.uploads.getObjectRaw(key);
    const contentType = obj.contentType || 'application/octet-stream';
    const contentLength = obj.contentLength;

    // 3) Headers y pipe del stream
    res.setHeader('Content-Type', contentType);
    if (typeof contentLength === 'number') {
      res.setHeader('Content-Length', String(contentLength));
    }
    // fuerza descarga con el nombre_original
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(nombre)}`,
    );

    obj.body.pipe(res);
  }
}
