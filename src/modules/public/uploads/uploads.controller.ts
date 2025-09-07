// src/modules/public/uploads/uploads.controller.ts
import {
  Controller, Get, Query, Delete, Post, Body, UseGuards, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UploadsService } from './uploads.service';
import { ArchivoService } from '../archivo/archivo.service';
type TipoArea = 'mantenimiento' | 'supervision';
import { Response } from 'express';
import { Res } from '@nestjs/common';


@UseGuards(AuthGuard('jwt'))
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploads: UploadsService,
    private readonly archivos: ArchivoService,
  ) { }

  // ───────────────── presign (PUT a MinIO) ─────────────────
  @Get('presign')
  presign(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
    @Query('codUsuario') codUsuario: string,
    @Query('tipo') tipoRaw?: string, // ← opcional
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
      tipo, // ← se va al path del objeto
    });
  }

  // ──────────────── listar (desde BD) ────────────────
  @Get('list')
  async list(
    @Query('codUsuario') codUsuario?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const cod = codUsuario !== undefined && codUsuario !== null && codUsuario !== ''
      ? Number(codUsuario)
      : undefined;
    if (codUsuario !== undefined && !Number.isFinite(cod!)) {
      throw new BadRequestException('codUsuario inválido');
    }
    const takeN = Math.min(Number(take ?? 50), 100);
    const skipN = Number(skip ?? 0);
    const { rows, total } = await this.archivos.listar({ codUsuario: cod, take: takeN, skip: skipN });
    return { total, rows };
  }

  // ──────────────── descarga firmada (GET temporal) ────────────────
  @Get('download-presign')
  async downloadPresign(@Query('key') key: string) {
    if (!key) throw new BadRequestException('key requerido');
    return this.uploads.createSignedDownloadUrl(key);
  }

  // ──────────────── borrar en MinIO + borrar SIEMPRE en BD ────────────────
  // src/modules/public/uploads/uploads.controller.ts

  @Delete()
  async remove(@Query('key') key: string) {
    if (!key) throw new BadRequestException('key requerido');

    // 1) S3 / MinIO
    await this.uploads.deleteObject(key);

    // 2) BD (sin filtrar por codUsuario)
    try {
      if (typeof (this.archivos as any).removeByKey === 'function') {
        await (this.archivos as any).removeByKey(key); // ← sin cod
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
  async complete(@Body() dto: {
    key: string;
    filename?: string;
    contentType?: string;
    size?: number;
    etag?: string | null;
    codUsuario?: number;
    tipo?: TipoArea; // opcional
  }) {
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
      area, // ← ahora compila y se guarda
    });

    return { ok: true, archivo: saved };
  }

  @Get('file')
  async streamFile(@Query('key') key: string, @Res() res: Response) {
    if (!key) throw new BadRequestException('key requerido');

    // 1) Intenta obtener metadatos desde BD para el nombre bonito
    let nombre = key.split('/').pop() || 'archivo';
    try {
      const rec =
        (await this.archivos['archivoRepo'].findOne({ where: { keyPath: key } as any })) ||
        (await this.archivos['archivoRepo'].findOne({ where: { rutaArchivo: key } as any }));
      if (rec?.nombreOriginal) nombre = String(rec.nombreOriginal);
    } catch {
      /* opcional: silencioso */
    }

    // 2) Pide el objeto a S3/MinIO
    const obj = await this.uploads.getObjectRaw(key); // ← método agregado abajo
    const contentType = obj.contentType || 'application/octet-stream';
    const contentLength = obj.contentLength;

    // 3) Headers y pipe del stream
    res.setHeader('Content-Type', contentType);
    if (typeof contentLength === 'number') {
      res.setHeader('Content-Length', String(contentLength));
    }
    // fuerza descarga con el nombre_original
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(nombre)}`);

    obj.body.pipe(res);
  }
}
