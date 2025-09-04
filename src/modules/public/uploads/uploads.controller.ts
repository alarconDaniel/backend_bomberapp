// uploads.controller.ts
import { Controller, Get, Query, Delete, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UploadsService } from './uploads.service';

@UseGuards(AuthGuard('jwt'))
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  // YA EXISTE
  @Get('presign')
  presign(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
    @Query('codUsuario') codUsuario: string,
  ) {
    return this.uploads.createSignedUploadUrl({
      filename,
      contentType,
      codUsuario: Number(codUsuario),
    });
  }

  // NUEVO: URL firmada de descarga
  @Get('download-presign')
  downloadPresign(@Query('key') key: string) {
    return this.uploads.createSignedDownloadUrl(key);
  }

  // NUEVO: listar por usuario (prefijo)
  @Get('list')
  list(@Query('codUsuario') codUsuario: string) {
    return this.uploads.listByUser(Number(codUsuario));
  }

  // NUEVO: borrar objeto
  @Delete()
  remove(@Query('key') key: string) {
    return this.uploads.deleteObject(key);
  }

  // Opcional: callback para registrar metadatos en tu BD
  @Post('complete')
  complete(@Body() data: { key: string; size?: number; contentType?: string }) {
    // guarda en tu tabla 'archivos' si quieres
    return { ok: true, saved: data };
  }
}
