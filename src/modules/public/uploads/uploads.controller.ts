// src/modules/public/uploads/uploads.controller.ts
import {
  Controller, Get, Query, Delete, Post, Body, UseGuards, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UploadsService } from './uploads.service';
import { ArchivoService } from '../archivo/archivo.service';
type TipoArea = 'mantenimiento' | 'supervision';


@UseGuards(AuthGuard('jwt'))
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploads: UploadsService,
    private readonly archivos: ArchivoService,
  ) {}

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
    @Query('codUsuario') codUsuario: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const cod = Number(codUsuario);
    if (!Number.isFinite(cod)) throw new BadRequestException('codUsuario inválido');
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
  @Delete()
  async remove(
    @Query('key') key: string,
    @Query('codUsuario') codUsuarioRaw?: string,
  ) {
    if (!key) throw new BadRequestException('key requerido');

    await this.uploads.deleteObject(key);

    const cod = codUsuarioRaw && Number.isFinite(Number(codUsuarioRaw)) ? Number(codUsuarioRaw) : undefined;
    try {
      if (typeof (this.archivos as any).removeByKey === 'function') {
        await (this.archivos as any).removeByKey(key, cod);
      } else {
        if (cod !== undefined) await this.archivos.eliminarPorPath(key, cod);
      }
    } catch { /* silencioso */ }

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
}
