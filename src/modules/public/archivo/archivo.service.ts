import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Express } from 'express';
import * as mime from 'mime-types';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Archivo } from 'src/models/archivo/archivo';

import { Usuario } from 'src/models/usuario/usuario';
import { DeepPartial } from 'typeorm'; 

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

function sanitizeSegment(s: string) {
  return s.replace(/[\\]/g, '/').replace(/^\/*|\/*$/g, '').replace(/[/]/g, '_');
}

function normKey(k: string) {
  return (k || '').replace(/^\/+/, '');
}

export type TipoArea = 'mantenimiento' | 'supervision';

@Injectable()
export class ArchivoService {
  
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly expiresIn: number;
  private readonly publicBase?: string;

  constructor(
    @InjectRepository(Archivo) private readonly archivoRepo: Repository<Archivo>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
  ) {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    const region = process.env.S3_REGION || 'us-east-1';
    const bucket = process.env.S3_BUCKET;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new InternalServerErrorException(
        'Faltan env S3_ENDPOINT / S3_ACCESS_KEY / S3_SECRET_KEY / S3_BUCKET',
      );
    }

    this.s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: true, // necesario para MinIO
      credentials: { accessKeyId, secretAccessKey },
    });

    this.bucket = bucket;
    this.expiresIn = Number(process.env.S3_PRESIGN_TTL_SEC ?? 300);
    this.publicBase = process.env.S3_PUBLIC_BASE; // opcional (si expones MinIO públicamente)
  }

  // ─────────────── helpers ───────────────
  private async asegurarUsuario(codUsuario?: number) {
    if (!codUsuario) return null;
    const usuario = await this.usuarioRepo.findOne({ where: { codUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  private validarMime(archivo: Express.Multer.File) {
    const tipo = archivo.mimetype || (mime.lookup(archivo.originalname) as string) || '';
    if (!TIPOS_PERMITIDOS.has(String(tipo))) {
      throw new BadRequestException(`Tipo de archivo no permitido: ${tipo}`);
    }
    return String(tipo);
  }

  private buildKey(params: {
    codUsuario: number;
    filename: string;
    tipo?: 'mantenimiento' | 'supervision';
    carpeta?: string;       // subcarpeta lógica
    overwrite?: boolean;
    forceName?: string;
  }) {
    const baseName = (params.forceName || params.filename || 'archivo.bin').trim();
    const safeName = sanitizeSegment(baseName);
    const userPrefix = `usuarios/${params.codUsuario}`;
    const tipoSeg = params.tipo ? `/${sanitizeSegment(params.tipo)}` : '';
    const carpetaSeg = params.carpeta ? `/${sanitizeSegment(params.carpeta)}` : '';

    if (params.overwrite) {
      // sobrescribe usando un nombre fijo
      return `${userPrefix}${tipoSeg}${carpetaSeg}/${safeName}`;
    }
    // nombre único con timestamp
    return `${userPrefix}${tipoSeg}${carpetaSeg}/${Date.now()}-${safeName}`;
  }

  // ─────────────── PRESIGN DESCARGA ───────────────
  async obtenerUrlDescargaFirmada(path: string) {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: path });
    return getSignedUrl(this.s3, cmd, { expiresIn: this.expiresIn });
  }

  // ─────────────── SUBIR (multipart al backend) ───────────────
  async subirDesdeBackend(
    archivo: Express.Multer.File,
    codUsuario: number,
    carpeta?: string,
    tipo?: 'mantenimiento' | 'supervision',
    opts?: { overwrite?: boolean; forceName?: string },
  ) {
    if (!archivo) throw new BadRequestException('archivo requerido');
    const mimeType = this.validarMime(archivo);

    await this.asegurarUsuario(codUsuario);

    const Key = this.buildKey({
      codUsuario,
      filename: archivo.originalname || `archivo.${mime.extension(mimeType) || 'bin'}`,
      tipo,
      carpeta,
      overwrite: opts?.overwrite ?? true,
      forceName: opts?.forceName,
    });

    try {
      // PUT a S3/MinIO
      const putRes = await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key,
          ContentType: mimeType,
          Body: archivo.buffer,
        }),
      );
      const etag = (putRes as any).ETag ?? null;

      // HEAD (opcional) para confirmar tamaño
      let size = archivo.size;
      try {
        const head = await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key }));
        if (typeof head.ContentLength === 'number') size = head.ContentLength;
      } catch {
        /* no crítico */
      }

      // Guardar/actualizar registro en BD
      const creado = await this.createOrUpdateS3Record({
        codUsuario,
        bucket: this.bucket,
        keyPath: Key,
        nombreOriginal: Key.split('/').pop() ?? Key,
        tipoContenido: mimeType,
        tamanoBytes: size,
        storageEtag: etag,
      });

      const downloadUrl = await this.obtenerUrlDescargaFirmada(Key);

      return {
        action: 'created' as const,
        archivo: creado,
        downloadUrl,
        s3: { bucket: this.bucket, key: Key, etag },
      };
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('[S3Upload]', e);
      throw new InternalServerErrorException('Fallo subiendo a S3/MinIO');
    }
  }

  // ─────────────── LISTAR (BD) ───────────────
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

  // (opcional) listar directo en S3 por tipo → prefijo usuarios/{cod}/{tipo}/
  async listarPorTipoS3(
    codUsuario: number,
    tipo: 'mantenimiento' | 'supervision',
    continuationToken?: string,
    pageSize = 50,
  ) {
    await this.asegurarUsuario(codUsuario);
    const Prefix = `usuarios/${codUsuario}/${sanitizeSegment(tipo)}/`;

    const resp = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix,
        ContinuationToken: continuationToken,
        MaxKeys: pageSize,
      }),
    );

    return {
      files: (resp.Contents ?? [])
        .filter(x => !!x.Key && x.Key !== Prefix)
        .map(x => ({
          id: x.Key!,
          name: x.Key!.split('/').pop()!,
          mimeType: '', // no disponible en el listado
          size: String(x.Size ?? 0),
          createdTime: x.LastModified?.toISOString?.() ?? undefined,
          webViewLink: undefined,
        })),
      nextPageToken: resp.IsTruncated ? resp.NextContinuationToken ?? null : null,
      folderId: Prefix, // semántico
    };
  }

  // ─────────────── ELIMINAR ───────────────
// ───────────────── eliminarPorPath: borra en S3 y en BD ─────────────────
async eliminarPorPath(path: string, codUsuario: number) {
  await this.asegurarUsuario(codUsuario);
  const Key = normKey(path);

  // 1) S3/MinIO — idempotente (si no existe, no debe romper)
  try {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key }));
  } catch (e: any) {
    // Muchos S3 devuelven 204 aunque no exista; si MinIO devolviera error,
    // sólo lo ignoramos si es claramente "not found".
    const code = String(e?.name || e?.Code || e?.code || '');
    if (!/NoSuchKey|NotFound/i.test(code)) {
      // eslint-disable-next-line no-console
      console.error('[S3Delete]', e);
      throw new InternalServerErrorException('Error eliminando en S3/MinIO');
    }
  }

  // 2) BD — borra por keyPath o rutaArchivo (legacy) en un solo roundtrip cada uno
  const { affected: a1 } = await this.archivoRepo.delete({ keyPath: Key, codUsuario } as any);
  const { affected: a2 } = await this.archivoRepo.delete({ rutaArchivo: Key, codUsuario } as any);

  return { deleted: true, dbRemoved: (a1 ?? 0) + (a2 ?? 0) > 0 };
}

// ───────────────── removeByKey: sólo BD (sin tocar S3) ─────────────────
async removeByKey(key: string, codUsuario?: number) {
  const Key = normKey(key);

  const whereA: any = codUsuario ? { keyPath: Key, codUsuario } : { keyPath: Key };
  const whereB: any = codUsuario ? { rutaArchivo: Key, codUsuario } : { rutaArchivo: Key };

  const r1 = await this.archivoRepo.delete(whereA);
  const r2 = await this.archivoRepo.delete(whereB);

  return { deleted: (r1.affected ?? 0) + (r2.affected ?? 0) > 0 };
}


  // ─────────────── URLS/confirmación ───────────────
  async obtenerUrlSubidaFirmada(
    _codUsuario: number,
    _nombreArchivo: string,
    _tipoContenido: string,
    _carpeta = 'docs',
  ) {
    // Si la app necesita presign de subida, úsalo desde UploadsService (/uploads/presign)
    throw new BadRequestException('Para subida directa usa /uploads/presign.');
  }

  async actualizarTamanoTrasSubida(path: string) {
    try {
      const head = await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: path }));
      const size = Number(head.ContentLength ?? 0);
      const etag = (head as any).ETag ?? null;

      const rec =
        (await this.archivoRepo.findOne({ where: { keyPath: path } as any })) ??
        (await this.archivoRepo.findOne({ where: { rutaArchivo: path } as any }));
      if (rec) {
        rec.tamanoBytes = String(size);
        (rec as any).storageEtag = etag;
        await this.archivoRepo.save(rec);
      }
      return { updated: true, size };
    } catch {
      return { updated: false, size: 0 };
    }
  }

  // ─────────────── BD helpers (S3) ───────────────
// src/modules/public/archivo/archivo.service.ts
async createOrUpdateS3Record(p: {
  codUsuario?: number | null;
  bucket: string;
  keyPath: string;
  nombreOriginal: string;
  tipoContenido: string;
  tamanoBytes?: string | number;
  storageEtag?: string | null;
  area?: TipoArea | null;
}) {
  // 1) buscar por keyPath o (legacy) rutaArchivo
  let rec: Archivo | null =
    (await this.archivoRepo.findOne({ where: { keyPath: p.keyPath } as any })) ??
    (await this.archivoRepo.findOne({ where: { rutaArchivo: p.keyPath } as any }));

  // 2) resolver área
  const inferArea = (): TipoArea | null => {
    const k = (p.keyPath || '').toLowerCase();
    if (k.includes('/mantenimiento/')) return 'mantenimiento';
    if (k.includes('/supervision/'))   return 'supervision';
    return null;
  };
  const areaFinal: TipoArea | null = p.area ?? inferArea();

  // 3) crear o actualizar
  if (!rec) {
    const nuevo = this.archivoRepo.create({
      codUsuario: p.codUsuario ?? null,
      provider: 's3',
      bucket: p.bucket,
      keyPath: p.keyPath,
      nombreOriginal: p.nombreOriginal,
      tipoContenido: p.tipoContenido,
      tamanoBytes: String(p.tamanoBytes ?? '0'),
      storageEtag: p.storageEtag ?? null,
      rutaArchivo: null,              // ← importante para no romper uk_ruta_archivo
      fechaCreacion: new Date(),
      area: areaFinal,
    } as any);

    return this.archivoRepo.save(nuevo);
  }

  // actualizar existente
  rec.nombreOriginal = p.nombreOriginal;
  rec.tipoContenido  = p.tipoContenido;
  rec.tamanoBytes    = String(p.tamanoBytes ?? rec.tamanoBytes ?? '0');
  (rec as any).storageEtag = p.storageEtag ?? (rec as any).storageEtag ?? null;

  if (p.area != null || !rec.area) rec.area = areaFinal;
  if (rec.provider === 's3' && (!rec.rutaArchivo || rec.rutaArchivo === '')) {
    rec.rutaArchivo = null;
  }

  return this.archivoRepo.save(rec);
}

}
