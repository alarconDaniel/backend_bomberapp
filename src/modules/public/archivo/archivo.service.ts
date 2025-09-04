import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Archivo } from 'src/models/archivo/archivo';
import { Usuario } from 'src/models/usuario/usuario';
import type { Express } from 'express';
import { drive_v3 } from 'googleapis';
import * as mime from 'mime-types';
import { Readable } from 'stream';
import { GoogleDriveOAuthService } from '../google-token/google-drive-oauth.service';

const TIPOS_PERMITIDOS = new Set<string>([
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

export interface ListarArchivosParams {
  codUsuario?: number;
  take: number;
  skip: number;
}

function streamFromBuffer(buf: Buffer) {
  const r = new Readable();
  r.push(buf);
  r.push(null);
  return r;
}

@Injectable()
export class ArchivoService {
  constructor(
    @InjectRepository(Archivo) private readonly archivoRepo: Repository<Archivo>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    private readonly driveOAuth: GoogleDriveOAuthService,
  ) {}

  // IDs desde .env
  private readonly DRIVE_ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
  private readonly DRIVE_FOLDER_MANTENIMIENTO = process.env.DRIVE_FOLDER_MANTENIMIENTO || '';
  private readonly DRIVE_FOLDER_SUPERVISION = process.env.DRIVE_FOLDER_SUPERVISION || '';

  private async asegurarUsuario(codUsuario?: number) {
    if (!codUsuario) return null;
    const usuario = await this.usuarioRepo.findOne({ where: { codUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  private resolveParentByTipo(tipo?: string): string {
    const t = (tipo || '').toLowerCase().trim();
    if (t === 'mantenimiento' && this.DRIVE_FOLDER_MANTENIMIENTO) return this.DRIVE_FOLDER_MANTENIMIENTO;
    if (t === 'supervision' && this.DRIVE_FOLDER_SUPERVISION) return this.DRIVE_FOLDER_SUPERVISION;
    if (this.DRIVE_ROOT_FOLDER_ID) return this.DRIVE_ROOT_FOLDER_ID;
    throw new BadRequestException('No hay carpeta destino configurada (revisa .env).');
  }

  private validarMime(archivo: Express.Multer.File) {
    const tipo = archivo.mimetype || (mime.lookup(archivo.originalname) as string) || '';
    if (!TIPOS_PERMITIDOS.has(String(tipo))) {
      throw new BadRequestException(`Tipo de archivo no permitido: ${tipo}`);
    }
    return String(tipo);
  }

  // Buscar por nombre exacto en una carpeta
  private async findByNameInFolder(
    drive: drive_v3.Drive,
    name: string,
    folderId: string,
  ): Promise<drive_v3.Schema$File[]> {
    const safeName = name.replace(/'/g, "\\'");
    const q = `name='${safeName}' and '${folderId}' in parents and trashed=false`;
    const { data } = await drive.files.list({
      q,
      fields: 'files(id,name,mimeType,size,parents,webViewLink,modifiedTime)',
      pageSize: 50,
      spaces: 'drive',
      corpus: 'user',
    });
    return data.files ?? [];
  }

  private async ensurePublicReadable(fileId: string, drive: drive_v3.Drive) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
      });
    } catch (e: any) {
      if (e?.code !== 403 && e?.code !== 400) {
        // eslint-disable-next-line no-console
        console.warn('[DrivePerms]', e?.response?.data || e);
      }
    }
  }

  async obtenerUrlDescargaFirmada(
    path: string,
    codUsuario: number,
    driveClient?: drive_v3.Drive,
  ) {
    const drive = driveClient || (await this.driveOAuth.getDrive(codUsuario));
    await this.ensurePublicReadable(path, drive);
    const { data } = await drive.files.get({ fileId: path, fields: 'id, webContentLink' });
    if (data.webContentLink) return data.webContentLink;
    return `https://www.googleapis.com/drive/v3/files/${path}?alt=media`;
  }

  // --------------------------- SUBIR (con sobrescritura por nombre) ---------------------------
  async subirDesdeBackend(
    archivo: Express.Multer.File,
    codUsuario: number,
    carpeta = 'docs', // si viene como 'id:<FOLDER_ID>' lo respeta
    tipo?: 'mantenimiento' | 'supervision',
    opts?: { overwrite?: boolean; forceName?: string },
  ) {
    if (!archivo) throw new BadRequestException('archivo requerido');
    const mimeType = this.validarMime(archivo);

    await this.asegurarUsuario(codUsuario);
    const drive = await this.driveOAuth.getDrive(codUsuario);

    let parentId = this.resolveParentByTipo(tipo);
    if (carpeta?.startsWith('id:')) {
      const override = carpeta.slice(3).trim();
      if (!override) throw new BadRequestException('carpeta con formato id:<FOLDER_ID> inválido');
      parentId = override;
    }

    const overwrite = opts?.overwrite ?? true;
    const nombreDestino =
      (opts?.forceName || archivo.originalname || `archivo.${mime.extension(mimeType) || 'bin'}`).trim();

    // ¿Existe un archivo con ese nombre en la carpeta?
    let targetId: string | null = null;
    if (overwrite && nombreDestino) {
      const matches = await this.findByNameInFolder(drive, nombreDestino, parentId);
      if (matches.length > 0) targetId = matches[0].id!;
    }

    const media = {
      mimeType,
      body: streamFromBuffer(archivo.buffer),
    };

    // Crear o actualizar en Drive
    let data: drive_v3.Schema$File;
    let action: 'created' | 'updated' = 'created';
    try {
      if (targetId) {
        const upd = await drive.files.update({
          fileId: targetId,
          media,
          requestBody: { name: nombreDestino },
          fields: 'id,name,mimeType,size,webViewLink,webContentLink,parents,modifiedTime',
        });
        data = upd.data;
        action = 'updated';
      } else {
        const res = await drive.files.create({
          requestBody: { name: nombreDestino, parents: [parentId] },
          media,
          fields: 'id,name,mimeType,size,webViewLink,webContentLink,parents,createdTime',
        });
        data = res.data;
        action = 'created';
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.error_description ||
        e?.response?.data?.error ||
        e?.message ||
        'Fallo subiendo a Drive';
      // eslint-disable-next-line no-console
      console.error('[DriveUpload]', e?.response?.data || e);
      throw new InternalServerErrorException(`Google Drive: ${msg}`);
    }

    const fileId = data.id!;
    await this.ensurePublicReadable(fileId, drive);

    // ---------------- FIX TypeORM: crear/actualizar sin null ----------------
    // Buscar registro por (rutaArchivo = fileId, codUsuario)
    let entity = await this.archivoRepo.findOne({
      where: { rutaArchivo: fileId, codUsuario } as any,
    });

    if (!entity) {
      // crear
      const nuevo: Partial<Archivo> = {
        rutaArchivo: fileId,
        nombreOriginal: nombreDestino,
        tipoContenido: data.mimeType || mimeType,
        tamanoBytes: String(data.size ?? archivo.size ?? 0),
        fechaCreacion: new Date(),
        codUsuario,
      };
      const creado = this.archivoRepo.create(nuevo);
      const guardado = await this.archivoRepo.save(creado);
      const downloadUrl = await this.obtenerUrlDescargaFirmada(fileId, codUsuario, drive);
      return {
        action, // created | updated (aquí será created)
        archivo: guardado,
        downloadUrl,
        driveDebug: { parents: data.parents ?? [] },
      };
    }

    // actualizar
    entity.nombreOriginal = nombreDestino;
    entity.tipoContenido = data.mimeType || mimeType;
    entity.tamanoBytes = String(data.size ?? Number(entity.tamanoBytes ?? 0));

    const guardado = await this.archivoRepo.save(entity);
    const downloadUrl = await this.obtenerUrlDescargaFirmada(fileId, codUsuario, drive);
    return {
      action,
      archivo: guardado,
      downloadUrl,
      driveDebug: { parents: data.parents ?? [] },
    };
  }

  // --------------------------- LISTAR (BD) ---------------------------
  async listar({ codUsuario, take, skip }: ListarArchivosParams) {
    if (codUsuario) await this.asegurarUsuario(codUsuario);
    const where = codUsuario ? { codUsuario } : {};
    const [rows, total] = await this.archivoRepo.findAndCount({
      where: where as any,
      order: { fechaCreacion: 'DESC' },
      take,
      skip,
    });
    return { total, rows };
  }

  // --------------------------- LISTAR (Drive por tipo) ---------------------------
  async listarPorTipoDrive(
    codUsuario: number,
    tipo: 'mantenimiento' | 'supervision',
    pageToken?: string,
    pageSize = 20,
  ) {
    await this.asegurarUsuario(codUsuario);
    const drive = await this.driveOAuth.getDrive(codUsuario);
    const folderId = this.resolveParentByTipo(tipo);

    const { data } = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,size,createdTime,webViewLink), nextPageToken',
      pageSize,
      pageToken,
      orderBy: 'createdTime desc',
    });

    return {
      files: data.files ?? [],
      nextPageToken: data.nextPageToken ?? null,
      folderId,
    };
  }

  // --------------------------- ELIMINAR ---------------------------
  async eliminarPorPath(path: string, codUsuario: number) {
    const drive = await this.driveOAuth.getDrive(codUsuario);
    try {
      await drive.files.delete({ fileId: path });
    } catch (e: any) {
      if (e?.code === 404) throw new NotFoundException('Archivo no encontrado en Drive');
      throw new InternalServerErrorException('Error eliminando en Drive');
    }
    const archivo = await this.archivoRepo.findOne({
      where: { rutaArchivo: path, codUsuario } as any,
    });
    if (archivo) await this.archivoRepo.remove(archivo);
    return { deleted: true };
  }

  // --------------------------- NO SOPORTADOS ---------------------------
  async obtenerUrlSubidaFirmada(
    _codUsuario: number,
    _nombreArchivo: string,
    _tipoContenido: string,
    _carpeta = 'docs',
  ) {
    throw new BadRequestException(
      'Subida directa no soportada con Google Drive. Usa POST /archivos/subir.',
    );
  }

  async actualizarTamanoTrasSubida(_path: string) {
    return { updated: false, size: 0 };
  }

  // === S3/MinIO: crear registro y actualizar metadatos ===

async createS3Record(p: {
  codUsuario?: number | null;
  bucket: string;
  keyPath: string;
  nombreOriginal: string;
  tipoContenido: string;
  tamanoBytes?: string | number;
  storageEtag?: string | null;
}) {
  const a = this.archivoRepo.create({
    codUsuario: p.codUsuario ?? null,
    provider: 's3',
    bucket: p.bucket,
    keyPath: p.keyPath,
    nombreOriginal: p.nombreOriginal,
    tipoContenido: p.tipoContenido,
    tamanoBytes: String(p.tamanoBytes ?? '0'),
    storageEtag: p.storageEtag ?? null,
    // legacy: la dejamos vacía para S3
    rutaArchivo: '',
  });
  return this.archivoRepo.save(a);
}

async updateAfterUpload(codArchivo: number, patch: Partial<Archivo>) {
  await this.archivoRepo.update({ codArchivo }, patch);
  return this.archivoRepo.findOneByOrFail({ codArchivo });
}

}
