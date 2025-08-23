// src/modules/public/usuario/usuario.service.ts
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

  listarUsuarios(): Promise<Partial<Usuario>[]> {
    return this.repo.find({
      select: [
        'codUsuario',
        'codRol',
        'nombreUsuario',
        'apellidoUsuario',
        'cedulaUsuario',
        'nicknameUsuario',
        'correoUsuario',
        'tokenVersion',
        'codCargoUsuario',
      ],
      order: { codUsuario: 'ASC' },
    });
  }

  async buscarUsuario(codUsuario: number): Promise<Partial<Usuario>> {
    const u = await this.repo.findOne({
      where: { codUsuario },
      select: [
        'codUsuario',
        'codRol',
        'nombreUsuario',
        'apellidoUsuario',
        'cedulaUsuario',
        'nicknameUsuario',
        'correoUsuario',
        'tokenVersion',
        'codCargoUsuario',
      ],
    });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async crearUsuario(body: Partial<Usuario>): Promise<Partial<Usuario>> {
    try {
      if (!body.codRol) {
        throw new HttpException('codRol es requerido', HttpStatus.BAD_REQUEST);
      }
      if (!body.contrasenaUsuario?.trim()) {
        throw new HttpException('contrasenaUsuario es requerida', HttpStatus.BAD_REQUEST);
      }
      // normalizaciones
      body.correoUsuario = body.correoUsuario?.trim().toLowerCase();
      body.nicknameUsuario = body.nicknameUsuario?.trim() ?? null;

      const entity = this.repo.create({
        codRol: body.codRol, // ← requerido por tu PK/DDL
        nombreUsuario: body.nombreUsuario!,
        apellidoUsuario: body.apellidoUsuario!,
        cedulaUsuario: body.cedulaUsuario!,
        nicknameUsuario: body.nicknameUsuario ?? null,
        correoUsuario: body.correoUsuario!,
        contrasenaUsuario: body.contrasenaUsuario!,
        refreshTokenHash: body.refreshTokenHash ?? null,
        tokenVersion: body.tokenVersion ?? 0,
        codCargoUsuario: body.codCargoUsuario ?? null, // opcional
      });

      const saved = await this.repo.save(entity);
      const { contrasenaUsuario, refreshTokenHash, ...safe } = saved as any;
      return safe;
    } catch (e: any) {
      // Duplicado (correo único) → 409
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new ConflictException('Correo ya registrado (duplicado)');
      }
      // FK inválida (rol o cargo no existen) → 400
      if (e?.code === 'ER_NO_REFERENCED_ROW_2' || e?.errno === 1452) {
        throw new HttpException('Rol/Cargo inválido (violación de FK)', HttpStatus.BAD_REQUEST);
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

    // No intentes cambiar codRol (parte de la PK). Lo dejamos tal cual.
    const updates: Partial<Usuario> = {
      nombreUsuario: obj.nombreUsuario ?? current.nombreUsuario,
      apellidoUsuario: obj.apellidoUsuario ?? current.apellidoUsuario,
      cedulaUsuario: obj.cedulaUsuario ?? current.cedulaUsuario,
      nicknameUsuario:
        obj.nicknameUsuario !== undefined ? obj.nicknameUsuario?.trim() ?? null : current.nicknameUsuario,
      correoUsuario: obj.correoUsuario ? obj.correoUsuario.trim().toLowerCase() : current.correoUsuario,
      contrasenaUsuario: obj.contrasenaUsuario ?? current.contrasenaUsuario,
      refreshTokenHash: obj.refreshTokenHash ?? current.refreshTokenHash,
      tokenVersion: obj.tokenVersion ?? current.tokenVersion,
      codCargoUsuario: obj.codCargoUsuario ?? current.codCargoUsuario,
      codRol: current.codRol, // ← mantenemos
    };

    const merged = this.repo.merge(current, updates);

    try {
      const saved = await this.repo.save(merged);
      const { contrasenaUsuario, refreshTokenHash, ...safe } = saved as any;
      return safe;
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new ConflictException('Correo ya registrado (duplicado)');
      }
      if (e?.code === 'ER_NO_REFERENCED_ROW_2' || e?.errno === 1452) {
        throw new HttpException('Rol/Cargo inválido (violación de FK)', HttpStatus.BAD_REQUEST);
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
