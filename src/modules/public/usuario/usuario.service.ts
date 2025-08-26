import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { Usuario } from 'src/models/usuario/usuario';

// DTO que devolvemos al cliente (sin password ni refresh)
type UsuarioListDTO = {
  codUsuario: number;
  codRol: number;
  codCargoUsuario: number | null;
  nombreUsuario: string;
  apellidoUsuario: string;
  cedulaUsuario: string;
  nicknameUsuario: string | null;
  correoUsuario: string;
  tokenVersion: number;
};

@Injectable()
export class UsuarioService {
  private readonly repo: Repository<Usuario>;
  constructor(private readonly ds: DataSource) {
    this.repo = ds.getRepository(Usuario);
  }

  private toDTO(u: Usuario): UsuarioListDTO {
    return {
      codUsuario: u.codUsuario,
      codRol: u.codRol,                         // viene de @RelationId
      codCargoUsuario: u.codCargoUsuario ?? null,
      nombreUsuario: u.nombreUsuario,
      apellidoUsuario: u.apellidoUsuario,
      cedulaUsuario: u.cedulaUsuario,
      nicknameUsuario: u.nicknameUsuario ?? null,
      correoUsuario: u.correoUsuario,
      tokenVersion: u.tokenVersion,
    };
  }

  async listarUsuarios(): Promise<UsuarioListDTO[]> {
    const rows = await this.repo.find({
      // No uses select con @RelationId; carga plano y mapea
      loadEagerRelations: false, // ignora eager:true en la entidad
      relations: {},             // no cargues relaciones
      order: { codUsuario: 'ASC' },
    });
    return rows.map(this.toDTO);
  }

  async buscarUsuario(codUsuario: number): Promise<UsuarioListDTO> {
    const u = await this.repo.findOne({
      where: { codUsuario },
      loadEagerRelations: false,
      relations: {},
    });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return this.toDTO(u);
  }

  // Auxiliares
  async findById(id: number) {
    return this.repo.findOne({ where: { codUsuario: id } });
  }

  async findByCorreo(correo: string) {
    return this.repo.findOne({ where: { correoUsuario: correo.toLowerCase() } });
  }

  async crearUsuario(body: Partial<Usuario>): Promise<UsuarioListDTO> {
    try {
      if (!body.codRol) throw new HttpException('codRol es requerido', HttpStatus.BAD_REQUEST);
      if (!body.contrasenaUsuario?.trim())
        throw new HttpException('contrasenaUsuario es requerida', HttpStatus.BAD_REQUEST);

      const correo = body.correoUsuario?.trim().toLowerCase();
      if (!correo) throw new HttpException('correoUsuario es requerido', HttpStatus.BAD_REQUEST);

      const ya = await this.repo.findOne({ where: { correoUsuario: correo }, select: ['codUsuario'] as any });
      if (ya) throw new ConflictException('Correo ya registrado (duplicado)');

      // si quieres hash real:
      // const passHash = await argon2.hash(body.contrasenaUsuario!);

      const entity = this.repo.create({
        nombreUsuario: body.nombreUsuario!,
        apellidoUsuario: body.apellidoUsuario!,
        cedulaUsuario: body.cedulaUsuario!,
        nicknameUsuario: body.nicknameUsuario?.trim() ?? null,
        correoUsuario: correo,
        contrasenaUsuario: body.contrasenaUsuario!, // o passHash
        refreshTokenHash: body.refreshTokenHash ?? null,
        tokenVersion: (body as any).tokenVersion ?? 0,

        // ✅ relaciones: así se guarda la FK (JoinColumn)
        rol: { codRol: Number(body.codRol) } as any,
        cargo:
          (body as any).codCargoUsuario != null
            ? ({ codCargoUsuario: Number((body as any).codCargoUsuario) } as any)
            : null,
      });

      const saved = await this.repo.save(entity);
      return this.toDTO(saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062)
        throw new ConflictException('Correo ya registrado (duplicado)');
      if (e?.code === 'ER_NO_REFERENCED_ROW_2' || e?.errno === 1452)
        throw new HttpException('Rol/Cargo inválido (violación de FK)', HttpStatus.BAD_REQUEST);
      if (e instanceof HttpException) throw e;
      throw new HttpException('Falla al registrar', HttpStatus.BAD_REQUEST);
    }
  }

  async modificarUsuario(obj: Partial<Usuario>): Promise<UsuarioListDTO> {
    if (!obj.codUsuario)
      throw new HttpException('codUsuario es requerido', HttpStatus.BAD_REQUEST);

    const current = await this.repo.findOne({
      where: { codUsuario: obj.codUsuario },
      loadEagerRelations: false,
      relations: {},
    });
    if (!current) throw new NotFoundException('Usuario no encontrado');

    const nextCorreo = obj.correoUsuario ? obj.correoUsuario.trim().toLowerCase() : undefined;
    if (nextCorreo && nextCorreo !== current.correoUsuario) {
      const yaExiste = await this.repo.findOne({
        where: { correoUsuario: nextCorreo },
        select: ['codUsuario'] as any,
      });
      if (yaExiste && yaExiste.codUsuario !== current.codUsuario)
        throw new ConflictException('Correo ya registrado (duplicado)');
    }

    const updates: Partial<Usuario> = {
      nombreUsuario: obj.nombreUsuario ?? current.nombreUsuario,
      apellidoUsuario: obj.apellidoUsuario ?? current.apellidoUsuario,
      cedulaUsuario: obj.cedulaUsuario ?? current.cedulaUsuario,
      nicknameUsuario:
        obj.nicknameUsuario !== undefined ? (obj.nicknameUsuario?.trim() ?? null) : current.nicknameUsuario,
      correoUsuario: nextCorreo ?? current.correoUsuario,
      contrasenaUsuario: obj.contrasenaUsuario ?? current.contrasenaUsuario,
      refreshTokenHash: obj.refreshTokenHash ?? current.refreshTokenHash,
      tokenVersion: (obj as any).tokenVersion ?? current.tokenVersion,

      // ✅ cambios en relaciones
      ...(obj.codRol
        ? { rol: { codRol: Number(obj.codRol) } as any }
        : {}),
      ...((obj as any).codCargoUsuario !== undefined
        ? {
            cargo:
              (obj as any).codCargoUsuario != null
                ? ({ codCargoUsuario: Number((obj as any).codCargoUsuario) } as any)
                : null,
          }
        : {}),
    };

    const merged = this.repo.merge(current, updates);

    try {
      const saved = await this.repo.save(merged);
      return this.toDTO(saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062)
        throw new ConflictException('Correo ya registrado (duplicado)');
      if (e?.code === 'ER_NO_REFERENCED_ROW_2' || e?.errno === 1452)
        throw new HttpException('Rol/Cargo inválido (violación de FK)', HttpStatus.BAD_REQUEST);
      throw new HttpException('No se actualiza', HttpStatus.BAD_REQUEST);
    }
  }

  async borrarUsuario(codUsuario: number): Promise<{ ok: true }> {
    const r = await this.repo.delete({ codUsuario });
    if (!r.affected) throw new NotFoundException('Usuario no encontrado');
    return { ok: true };
  }

  // ---- usados por auth/perfil ----
  async setRefreshTokenHash(codUsuario: number, hash: string) {
    await this.repo.update({ codUsuario }, { refreshTokenHash: hash });
  }

  async clearRefreshTokenHash(codUsuario: number) {
    await this.repo.update({ codUsuario }, { refreshTokenHash: null });
    await this.incrementTokenVersion(codUsuario);
  }

  async verifyRefreshToken(codUsuario: number, plainToken: string) {
    const u = await this.findById(codUsuario);
    if (!u || !u.refreshTokenHash) return false;
    return argon2.verify(u.refreshTokenHash, plainToken);
  }

  async updatePasswordHash(codUsuario: number, passwordHash: string) {
    await this.repo.update({ codUsuario }, { contrasenaUsuario: passwordHash });
  }

  async incrementTokenVersion(codUsuario: number) {
    await this.repo.increment({ codUsuario }, 'tokenVersion', 1);
  }

  async updateNickname(codUsuario: number, nickname: string | null) {
    await this.repo.update({ codUsuario }, { nicknameUsuario: nickname });
    return this.findById(codUsuario);
  }

  async changePassword(codUsuario: number, current: string, next: string) {
    const user = await this.findById(codUsuario);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const ok = await argon2.verify(user.contrasenaUsuario, current);
    if (!ok) throw new HttpException('Contraseña actual incorrecta', HttpStatus.BAD_REQUEST);
    const newHash = await argon2.hash(next);
    await this.updatePasswordHash(codUsuario, newHash);
    await this.incrementTokenVersion(codUsuario);
    return { ok: true };
  }
}
