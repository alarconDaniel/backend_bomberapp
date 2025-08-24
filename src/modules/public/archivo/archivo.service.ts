// src/modules/public/archivo/archivo.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Archivo } from '../../../models/archivo/archivo';
import { Usuario } from '../../../models/usuario/usuario';

import type { Express } from 'express';
import { google, drive_v3 } from 'googleapis';
import * as mime from 'mime-types';

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

/** Convierte un file de Drive a la forma común usada en el front */
function mapDriveFileToRow(f: drive_v3.Schema$File) {
  return {
    codArchivo: undefined,
    nombreOriginal: f.name || 'archivo',
    path: f.id!, // usamos fileId como "path"
    contentType: f.mimeType || 'application/octet-stream',
    sizeBytes: Number(f.size || 0),
    fechaSubida: f.createdTime || new Date().toISOString(),
    area: null,
    codUsuario: undefined,
  };
}

@Injectable()
export class ArchivoService {
  constructor(
    @InjectRepository(Archivo) private readonly archivoRepo: Repository<Archivo>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  /** Verifica que el usuario exista (si se envía codUsuario) */
  private async asegurarUsuario(codUsuario?: number) {
    if (!codUsuario) return null;
    const usuario = await this.usuarioRepo.findOne({ where: { codUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  /** Sube vía backend (multipart) a Google Drive y guarda metadatos en BD */
  async subirDesdeBackend(
    archivo: Express.Multer.File,
    codUsuario: number,
    carpeta = 'docs',
  ) {
    if (!archivo) throw new BadRequestException('archivo requerido');
    if (!TIPOS_PERMITIDOS.has(archivo.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }

    // valida usuario (aunque en BD guardamos solo el cod_usuario)
    await this.asegurarUsuario(codUsuario);

    const drive = getDrive();
    const rootId = getRootFolderId();
    const parentId = await ensureSubfolder(drive, rootId, carpeta);

    const nombre =
      archivo.originalname || `archivo.${mime.extension(archivo.mimetype) || 'bin'}`;

    // Subir a Drive
    const res = await drive.files.create({
      requestBody: { name: nombre, parents: [parentId] },
      media: {
        mimeType: archivo.mimetype || 'application/octet-stream',
        body: archivo.buffer,
      },
      fields: 'id, name, mimeType, size, createdTime, webViewLink, webContentLink',
    });

    const fileId = res.data.id;
    if (!fileId) throw new InternalServerErrorException('No se pudo subir a Drive');

    // Permitir descarga pública (opcional)
    await this.ensurePublicReadable(fileId, drive);

    // Guardar metadatos en BD (ALINEADO A TU ESQUEMA)
    const entity = this.archivoRepo.create({
      // columnas reales:
      rutaArchivo: fileId,                                  // ruta_archivo
      nombreOriginal: nombre,                               // nombre_original
      tipoContenido: res.data.mimeType || archivo.mimetype, // tipo_contenido
      tamanoBytes: String(res.data.size || archivo.size || 0), // tamano_bytes (transformer -> string)
      codUsuario,                                           // cod_usuario
      // area: puedes setearla si la usas
    });
    const guardado = await this.archivoRepo.save(entity);

    const downloadUrl = await this.obtenerUrlDescargaFirmada(fileId, drive);
    return { archivo: guardado, downloadUrl };
  }

  /** Asegura permiso de lectura pública a un archivo de Drive */
  private async ensurePublicReadable(fileId: string, drive: drive_v3.Drive) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
      });
    } catch (e: any) {
      if (e?.code !== 403 && e?.code !== 400) {
        // console.warn('ensurePublicReadable', e?.message || e);
      }
    }
  }

  /** URL de descarga para un fileId de Drive */
  async obtenerUrlDescargaFirmada(path: string, driveClient?: drive_v3.Drive) {
    const drive = driveClient || getDrive();

    // asegura público
    await this.ensurePublicReadable(path, drive);

    const { data } = await drive.files.get({
      fileId: path,
      fields: 'id, webContentLink',
    });

    if (data.webContentLink) return data.webContentLink;

    // Fallback directo
    return `https://www.googleapis.com/drive/v3/files/${path}?alt=media`;
  }

  /** URL firmada para subida directa → no aplica en Drive */
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

  /** No-op en Drive (no necesitamos confirmar tamaño) */
  async actualizarTamanoTrasSubida(_path: string) {
    return { updated: false, size: 0 };
  }

  /** Listar desde tu BD, ordenando por fecha_creacion */
  async listar({ codUsuario, take, skip }: ListarArchivosParams) {
    if (codUsuario) await this.asegurarUsuario(codUsuario);

    const where = codUsuario ? { codUsuario } : {};
    const [rows, total] = await this.archivoRepo.findAndCount({
      where: where as any,
      order: { fechaCreacion: 'DESC' }, // columna real
      take,
      skip,
    });

    return { total, rows };
  }

  /** Eliminar en Drive + eliminar registro en BD (validando propietario) */
  async eliminarPorPath(path: string, codUsuario: number) {
    const drive = getDrive();

    // Borra en Drive (path = fileId)
    try {
      await drive.files.delete({ fileId: path });
    } catch (e: any) {
      if (e?.code === 404) throw new NotFoundException('Archivo no encontrado en Drive');
      throw new InternalServerErrorException('Error eliminando en Drive');
    }

    // Quita de BD si pertenece al usuario
    const archivo = await this.archivoRepo.findOne({
      where: { rutaArchivo: path, codUsuario },
    });
    if (archivo) {
      await this.archivoRepo.remove(archivo);
    }

    return { deleted: true };
  }
}
