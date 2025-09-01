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
import { ArchivoService } from './archivo.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt')) // 👈 protege TODO el controller con JWT
@Controller('archivos')      // → /api/archivos/*
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) {}

  // Si quieres un ping público, elimínalo o quítale el guard a nivel clase
  @Get('listar')
  async listarArchivos(
    @Req() req: Request,
    @Query('codUsuario') codUsuarioRaw?: string,
    @Query('take') takeRaw?: string,
    @Query('skip') skipRaw?: string,
  ) {
    const take = Math.min(Number(takeRaw ?? 20), 100);
    const skip = Number(skipRaw ?? 0);

    // Si no viene en query, se usa el del token
    let codUsuario: number | undefined;
    if (codUsuarioRaw) {
      const parsed = Number(codUsuarioRaw);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new BadRequestException('codUsuario inválido');
      }
      codUsuario = parsed;
    } else {
      const user: any = (req as any).user; // viene de jwt.strategy.ts (validate() → req.user)
      codUsuario = user?.sub;
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
    @Req() req: Request,
    @Body() dto: { codUsuario?: number; nombre: string; tipoContenido: string; carpeta?: string },
  ) {
    if (!dto?.nombre || !dto?.tipoContenido) throw new BadRequestException('Datos inválidos');
    const user: any = (req as any).user;
    const codUsuario = Number(dto.codUsuario ?? user?.sub ?? 0);
    return this.archivoService.obtenerUrlSubidaFirmada(
      codUsuario,
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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async subirArchivo(
    @Req() req: Request,
    @UploadedFile() archivo: Express.Multer.File,
    @Body('codUsuario') codUsuarioRaw?: string,
  ) {
    const user: any = (req as any).user;
    const codUsuario = codUsuarioRaw ? Number(codUsuarioRaw) : Number(user?.sub ?? 0);
    if (!archivo) throw new BadRequestException('archivo requerido');
    return this.archivoService.subirDesdeBackend(archivo, codUsuario, 'docs');
  }

  @Delete('eliminar')
  async eliminarArchivo(@Req() req: Request, @Body() dto: { codUsuario?: number; path: string }) {
    if (!dto?.path) throw new BadRequestException('Datos inválidos');
    const user: any = (req as any).user;
    return this.archivoService.eliminarPorPath(dto.path, Number(dto.codUsuario ?? user?.sub ?? 0));
  }

  // Fallback si RN complica DELETE con body
  @Post('eliminar')
  async eliminarArchivoPost(@Req() req: Request, @Body() dto: { codUsuario?: number; path: string }) {
    if (!dto?.path) throw new BadRequestException('Datos inválidos');
    const user: any = (req as any).user;
    return this.archivoService.eliminarPorPath(dto.path, Number(dto.codUsuario ?? user?.sub ?? 0));
  }
}
