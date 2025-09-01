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

@UseGuards(AuthGuard('jwt'))
@Controller('archivos')
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) {}

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

  private getParam<T = string>(req: Request, key: string): T | undefined {
    const b = (req as any).body?.[key];
    const q = (req as any).query?.[key];
    return (b !== undefined && b !== null && b !== '') ? b : q;
  }

  @Get('ping-drive')
  async pingDrive(@Req() req: Request) {
    const codUsuario = this.getCodUsuario(req);
    try {
      await this.archivoService.listar({ codUsuario, take: 1, skip: 0 });
      return { ok: true, note: 'Drive conectado para este usuario.' };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  }

  @Get('listar')
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

  // listar por tipo (mantenimiento/supervision) directo desde Drive
  @Get('listar-por-tipo')
  async listarPorTipo(
    @Req() req: Request,
    @Query('tipo') tipo: 'mantenimiento' | 'supervision',
    @Query('pageToken') pageToken?: string,
    @Query('pageSize') pageSizeRaw?: string,
  ) {
    if (!tipo) throw new BadRequestException('tipo requerido (mantenimiento | supervision)');
    const codUsuario = this.getCodUsuario(req);
    const pageSize = Math.min(Number(pageSizeRaw ?? 20), 100);
    return this.archivoService.listarPorTipoDrive(codUsuario, tipo, pageToken, pageSize);
  }

  @Get('url-descarga')
  async generarUrlDescarga(@Req() req: Request, @Query('path') path: string) {
    if (!path) throw new BadRequestException('path requerido');
    const codUsuario = this.getCodUsuario(req);
    const url = await this.archivoService.obtenerUrlDescargaFirmada(path, codUsuario);
    return { url };
  }

  @Post('confirmar-tamano')
  async confirmarTamano(@Body('path') path: string) {
    if (!path) throw new BadRequestException('path requerido');
    return this.archivoService.actualizarTamanoTrasSubida(path);
  }

  // SUBIR: respeta nombre exacto y sobrescribe si ya existe en la carpeta
  // Ejemplos:
  // POST /archivos/subir?tipo=mantenimiento&overwrite=true
  // POST /archivos/subir?carpeta=id:XXXXX&name=TerceraEntrega.pdf
  @Post('subir')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async subirArchivo(
    @Req() req: Request,
    @UploadedFile() archivo: Express.Multer.File,
    @Body('codUsuario') codUsuarioRaw?: string,
  ) {
    if (!archivo) throw new BadRequestException('archivo requerido');

    const tipo = this.getParam<'mantenimiento' | 'supervision'>(req, 'tipo');
    const carpeta = this.getParam<string>(req, 'carpeta');   // opcional: 'id:<FOLDER_ID>'
    const forceName = this.getParam<string>(req, 'name');    // opcional: nombre destino
    const overwriteRaw = this.getParam<string>(req, 'overwrite');
    const overwrite = overwriteRaw === undefined ? true : String(overwriteRaw).toLowerCase() !== 'false';

    const codUsuario = this.getCodUsuario(req, codUsuarioRaw);

    return this.archivoService.subirDesdeBackend(
      archivo,
      codUsuario,
      carpeta,
      tipo,
      { overwrite, forceName },
    );
  }

  @Delete('eliminar')
  async eliminarArchivo(@Req() req: Request, @Body() dto: { codUsuario?: number; path: string }) {
    if (!dto?.path) throw new BadRequestException('Datos inválidos');
    const codUsuario = this.getCodUsuario(req, dto.codUsuario);
    return this.archivoService.eliminarPorPath(dto.path, codUsuario);
  }

  @Post('eliminar')
  async eliminarArchivoPost(@Req() req: Request, @Body() dto: { codUsuario?: number; path: string }) {
    if (!dto?.path) throw new BadRequestException('Datos inválidos');
    const codUsuario = this.getCodUsuario(req, dto.codUsuario);
    return this.archivoService.eliminarPorPath(dto.path, codUsuario);
  }
}
