import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';        // 👈 DataSource (no InjectRepository)

import { Archivo } from 'src/models/archivo/archivo';
import { Usuario } from 'src/models/usuario/usuario';

import type { Express } from 'express';
import { google, drive_v3 } from 'googleapis';
import * as mime from 'mime-types';
import { Readable } from 'stream';

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

/** Auth + cliente de Google Drive */
function getDrive(): drive_v3.Drive {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY || '';
  if (!clientEmail || !privateKey) {
    throw new InternalServerErrorException(
      'Faltan GOOGLE_DRIVE_CLIENT_EMAIL / GOOGLE_DRIVE_PRIVATE_KEY',
    );
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

function getRootFolderId(): string {
  const id = (process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim();
  if (!id) throw new InternalServerErrorException('Falta GOOGLE_DRIVE_FOLDER_ID');
  return id;
}

/** Busca (o crea) subcarpeta dentro de la raíz */
async function ensureSubfolder(
  drive: drive_v3.Drive,
  parentId: string,
  name: string,
): Promise<string> {
  if (!name) return parentId;

  const q = [
    `'${parentId}' in parents`,
    `name = '${name.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
  ].join(' and ');

  const { data } = await drive.files.list({
    q,
    fields: 'files(id,name)',
    pageSize: 1,
  });

  const found = data.files?.[0];
  if (found?.id) return found.id;

  const created = await drive.files.create({
    requestBody: {
      name,
      parents: [parentId],
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });
  if (!created.data.id) {
    throw new InternalServerErrorException('No se pudo crear la carpeta en Drive');
  }
  return created.data.id;
}

@Injectable()
export class ArchivoService {
  private readonly archivoRepo: Repository<Archivo>;
  private readonly usuarioRepo: Repository<Usuario>;

  constructor(private readonly ds: DataSource) {        // 👈 inyecta tu DataSource
    this.archivoRepo = ds.getRepository(Archivo);       // 👈 repos manuales
    this.usuarioRepo = ds.getRepository(Usuario);
  }

  private async asegurarUsuario(codUsuario?: number) {
    if (!codUsuario) return null;
    const usuario = await this.usuarioRepo.findOne({ where: { codUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async subirDesdeBackend(
    archivo: Express.Multer.File,
    codUsuario: number,
    carpeta = 'docs',
  ) {
    if (!archivo) throw new BadRequestException('archivo requerido');
    if (!TIPOS_PERMITIDOS.has(archivo.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }

    await this.asegurarUsuario(codUsuario);

    const drive = getDrive();
    const rootId = getRootFolderId();
    const parentId = await ensureSubfolder(drive, rootId, carpeta);

    const nombre =
      archivo.originalname || `archivo.${mime.extension(archivo.mimetype) || 'bin'}`;

    const res = await drive.files.create({
      requestBody: { name: nombre, parents: [parentId] },
      media: {
        mimeType: archivo.mimetype || 'application/octet-stream',
        body: Readable.from(archivo.buffer),
      },
      fields: 'id, name, mimeType, size, createdTime, webViewLink, webContentLink',
    });

    const fileId = res.data.id;
    if (!fileId) throw new InternalServerErrorException('No se pudo subir a Drive');

    await this.ensurePublicReadable(fileId, drive);

    const entity = this.archivoRepo.create({
      rutaArchivo: fileId,
      nombreOriginal: nombre,
      tipoContenido: res.data.mimeType || archivo.mimetype || 'application/octet-stream',
      tamanoBytes: String(res.data.size || archivo.size || 0),
      fechaCreacion: new Date(),
      codUsuario,
    } as any);
    const guardado = await this.archivoRepo.save(entity);

    const downloadUrl = await this.obtenerUrlDescargaFirmada(fileId, drive);
    return { archivo: guardado, downloadUrl };
  }

  private async ensurePublicReadable(fileId: string, drive: drive_v3.Drive) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
      });
    } catch (e: any) {
      if (e?.code !== 403 && e?.code !== 400) {
        // noop
      }
    }
  }

  async obtenerUrlDescargaFirmada(path: string, driveClient?: drive_v3.Drive) {
    const drive = driveClient || getDrive();

    await this.ensurePublicReadable(path, drive);

    const { data } = await drive.files.get({
      fileId: path,
      fields: 'id, webContentLink',
    });

    if (data.webContentLink) return data.webContentLink;
    return `https://www.googleapis.com/drive/v3/files/${path}?alt=media`;
  }

  async obtenerUrlSubidaFirmada(
    _codUsuario: number,
    _nombreArchivo: string,
    _tipoContenido: string,
    _carpeta = 'docs',
  ) {
    throw new BadRequestException(
      'Subida directa no soportada con Google Drive. Usa POST /archivo/subir.',
    );
  }

  async actualizarTamanoTrasSubida(_path: string) {
    return { updated: false, size: 0 };
  }

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

  async eliminarPorPath(path: string, codUsuario: number) {
    const drive = getDrive();

    try {
      await drive.files.delete({ fileId: path });
    } catch (e: any) {
      if (e?.code === 404) throw new NotFoundException('Archivo no encontrado en Drive');
      throw new InternalServerErrorException('Error eliminando en Drive');
    }

    const archivo = await this.archivoRepo.findOne({
      where: { rutaArchivo: path, codUsuario } as any,
    });
    if (archivo) {
      await this.archivoRepo.remove(archivo);
    }

    return { deleted: true };
  }
}
