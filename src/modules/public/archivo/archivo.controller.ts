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
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import type { Express } from 'express';
  import { memoryStorage } from 'multer';
  import { ArchivoService } from './archivo.service';
  
  @Controller('archivos') // 👈 SIN prefijo "public"
  export class ArchivoController {
    constructor(private readonly archivoService: ArchivoService) {}
  
    @Get('ping')
    ping() { return { ok: true, scope: 'archivos' }; }
  
    @Get('listar')
    async listarArchivos(
      @Query('codUsuario') codUsuarioRaw?: string,
      @Query('take') takeRaw?: string,
      @Query('skip') skipRaw?: string,
    ) {
      const take = Math.min(Number(takeRaw ?? 20), 100);
      const skip = Number(skipRaw ?? 0);
      const codUsuario = codUsuarioRaw ? Number(codUsuarioRaw) : undefined;
      if (codUsuarioRaw && (!Number.isFinite(codUsuario!) || codUsuario! <= 0)) {
        throw new BadRequestException('codUsuario inválido');
      }
      return this.archivoService.listar({ codUsuario, take, skip });
    }
  
    @Get('url-descarga')
    async generarUrlDescarga(@Query('path') path: string) {
      if (!path) throw new BadRequestException('path requerido');
      const url = await this.archivoService.obtenerUrlDescargaFirmada(path);
      return { url };
    }
  
    @Post('url-subida')
    async generarUrlSubida(
      @Body() dto: { codUsuario?: number; nombre: string; tipoContenido: string; carpeta?: string },
    ) {
      if (!dto?.nombre || !dto?.tipoContenido) throw new BadRequestException('Datos inválidos');
      return this.archivoService.obtenerUrlSubidaFirmada(
        Number(dto.codUsuario ?? 0),
        dto.nombre,
        dto.tipoContenido,
        dto.carpeta ?? 'docs',
      );
    }
  
    @Post('confirmar-tamano')
    async confirmarTamano(@Body('path') path: string) {
      if (!path) throw new BadRequestException('path requerido');
      return this.archivoService.actualizarTamanoTrasSubida(path);
    }
  
    @Post('subir')
    @UseInterceptors(FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }))
    async subirArchivo(
      @UploadedFile() archivo: Express.Multer.File,
      @Body('codUsuario') codUsuarioRaw?: string,
    ) {
      const codUsuario = codUsuarioRaw ? Number(codUsuarioRaw) : 0;
      if (!archivo) throw new BadRequestException('archivo requerido');
      return this.archivoService.subirDesdeBackend(archivo, codUsuario, 'docs');
    }
  
    @Delete('eliminar')
    async eliminarArchivo(@Body() dto: { codUsuario?: number; path: string }) {
      if (!dto?.path) throw new BadRequestException('Datos inválidos');
      return this.archivoService.eliminarPorPath(dto.path, Number(dto.codUsuario ?? 0));
    }
  
    // Fallback si DELETE con body da problemas en RN:
    @Post('eliminar')
    async eliminarArchivoPost(@Body() dto: { codUsuario?: number; path: string }) {
      if (!dto?.path) throw new BadRequestException('Datos inválidos');
      return this.archivoService.eliminarPorPath(dto.path, Number(dto.codUsuario ?? 0));
    }
  }
  