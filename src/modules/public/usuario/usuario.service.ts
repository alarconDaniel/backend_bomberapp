import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from 'src/models/usuario/usuario';

@Injectable()
export class UsuarioService {
  private readonly repo: Repository<Usuario>;

  constructor(private readonly ds: DataSource) {
    this.repo = ds.getRepository(Usuario);
  }

  // Lista sin datos sensibles
  listarUsuarios(): Promise<Partial<Usuario>[]> {
    return this.repo.find({
      select: [
        'codUsuario',
        'nombreUsuario',
        'apellidoUsuario',
        'cedulaUsuario',
        'nicknameUsuario',
        'correoUsuario',
        'tokenVersion',
        'activo',
        'creadoEn',
        'actualizadoEn',
      ],
      order: { codUsuario: 'ASC' },
    });
  }

  async buscarUsuario(codUsuario: number): Promise<Partial<Usuario>> {
    const u = await this.repo.findOne({
      where: { codUsuario },
      select: [
        'codUsuario',
        'nombreUsuario',
        'apellidoUsuario',
        'cedulaUsuario',
        'nicknameUsuario',
        'correoUsuario',
        'tokenVersion',
        'activo',
        'creadoEn',
        'actualizadoEn',
      ],
    });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async crearUsuario(body: Partial<Usuario>): Promise<Partial<Usuario>> {
    try {
      if (!body.contrasenaUsuario?.trim()) {
        throw new HttpException('contrasenaUsuario es requerida', HttpStatus.BAD_REQUEST);
      }
      // normalizaciones (la entidad también tiene @BeforeInsert)
      body.correoUsuario = body.correoUsuario?.trim().toLowerCase();
      body.nicknameUsuario = body.nicknameUsuario?.trim();

      // ✅ crea instancia de la clase Usuario
      const entity = this.repo.create({
        nombreUsuario: body.nombreUsuario!,
        apellidoUsuario: body.apellidoUsuario!,
        cedulaUsuario: body.cedulaUsuario!,
        nicknameUsuario: body.nicknameUsuario!,
        correoUsuario: body.correoUsuario!,
        contrasenaUsuario: body.contrasenaUsuario!,
        refreshTokenHash: body.refreshTokenHash ?? null,
        tokenVersion: body.tokenVersion ?? 0,
        activo: body.activo ?? true,
      });

      const saved = await this.repo.save(entity);
      const { contrasenaUsuario, refreshTokenHash, ...safe } = saved as any;
      return safe;
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new ConflictException('Correo / Cédula / Nickname ya registrado');
      }
      if (e instanceof HttpException) throw e;
      throw new HttpException('Falla al registrar', HttpStatus.BAD_REQUEST);
    }
  }

  async modificarUsuario(obj: Partial<Usuario>): Promise<Partial<Usuario>> {
    if (!obj.codUsuario) {
      throw new HttpException('codUsuario es requerido', HttpStatus.BAD_REQUEST);
    }

    const current = await this.repo.findOne({ where: { codUsuario: obj.codUsuario } });
    if (!current) throw new NotFoundException('Usuario no encontrado');

    // prepara cambios (sin pisar con undefined)
    const updates: Partial<Usuario> = {
      nombreUsuario: obj.nombreUsuario ?? current.nombreUsuario,
      apellidoUsuario: obj.apellidoUsuario ?? current.apellidoUsuario,
      cedulaUsuario: obj.cedulaUsuario ?? current.cedulaUsuario,
      nicknameUsuario: obj.nicknameUsuario ?? current.nicknameUsuario,
      correoUsuario: obj.correoUsuario
        ? obj.correoUsuario.trim().toLowerCase()
        : current.correoUsuario,
      contrasenaUsuario: obj.contrasenaUsuario ?? current.contrasenaUsuario,
      refreshTokenHash: obj.refreshTokenHash ?? current.refreshTokenHash,
      tokenVersion: obj.tokenVersion ?? current.tokenVersion,
      activo: obj.activo ?? current.activo,
      // creadoEn/actualizadoEn los maneja la DB; no hace falta setearlos
    };

    // ✅ MERGE sobre una instancia existente (conserva métodos de clase)
    const merged = this.repo.merge(current, updates);

    try {
      const saved = await this.repo.save(merged);
      const { contrasenaUsuario, refreshTokenHash, ...safe } = saved as any;
      return safe;
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new ConflictException('Correo / Cédula / Nickname ya registrado');
      }
      throw new HttpException('No se actualiza', HttpStatus.BAD_REQUEST);
    }
  }

  async borrarUsuario(codUsuario: number): Promise<{ ok: true }> {
    const r = await this.repo.delete({ codUsuario });
    if (!r.affected) throw new NotFoundException('Usuario no encontrado');
    return { ok: true };
  }
}
