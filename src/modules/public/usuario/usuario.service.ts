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

import { CrearUsuarioDto } from 'src/modules/public/usuario/dto/crear-usuario.dto';
import { ModificarUsuarioDto } from 'src/modules/public/usuario/dto/modificar-usuario.dto';
import { CargoUsuario } from 'src/models/cargo_usuario/cargo-usuario';

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
  private readonly cargosRepo: Repository<CargoUsuario>;

  constructor(private readonly ds: DataSource) {
    this.cargosRepo = ds.getRepository(CargoUsuario);
    this.repo = ds.getRepository(Usuario);
  }

  /**
   * Proyección mínima de Usuario hacia el frontend / API.
   * Evita exponer hashes, refresh tokens y otras columnas internas.
   */
  private toDTO(u: Usuario): UsuarioListDTO {
    return {
      codUsuario: u.codUsuario,
      codRol: u.codRol,
      codCargoUsuario: u.codCargoUsuario ?? null,
      nombreUsuario: u.nombreUsuario,
      apellidoUsuario: u.apellidoUsuario,
      cedulaUsuario: u.cedulaUsuario,
      nicknameUsuario: u.nicknameUsuario ?? null,
      correoUsuario: u.correoUsuario,
      tokenVersion: u.tokenVersion,
    };
  }

  /**
   * Lista básica de usuarios (sin relaciones ni datos sensibles).
   */
  async listarUsuarios(): Promise<UsuarioListDTO[]> {
    const rows = await this.repo.find({
      loadEagerRelations: false,
      relations: {},
      order: { codUsuario: 'ASC' },
    });
    return rows.map((u) => this.toDTO(u));
  }

  /**
   * Busca un usuario por ID o lanza 404.
   */
  async buscarUsuario(codUsuario: number): Promise<UsuarioListDTO> {
    const u = await this.repo.findOne({
      where: { codUsuario },
      loadEagerRelations: false,
      relations: {},
    });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return this.toDTO(u);
  }

  // Auxiliares de consulta usados por otros módulos / auth

  async findById(id: number) {
    return this.repo.findOne({ where: { codUsuario: id } });
  }

  async findByCorreo(correo: string) {
    return this.repo.findOne({ where: { correoUsuario: correo.toLowerCase() } });
  }

  /**
   * Devuelve el nombre del cargo a partir del ID, o null si no existe.
   */
  async getCargoNombreById(codCargo: number | null | undefined): Promise<string | null> {
    if (!codCargo) return null;
    const cargo = await this.cargosRepo.findOne({ where: { codCargoUsuario: codCargo } });
    return cargo?.nombreCargo ?? null;
  }

  // ================== CREAR ==================

  /**
   * Crea un usuario nuevo, hasheando siempre la contraseña
   * y validando unicidad de correo y FKs de rol/cargo.
   */
  async crearUsuario(body: CrearUsuarioDto): Promise<UsuarioListDTO> {
    try {
      if (!body.codRol) {
        throw new HttpException('codRol es requerido', HttpStatus.BAD_REQUEST);
      }
      if (!body.contrasenaUsuario?.trim()) {
        throw new HttpException('contrasenaUsuario es requerida', HttpStatus.BAD_REQUEST);
      }

      const correo = body.correoUsuario.trim().toLowerCase();

      // Verificación explícita de duplicado para dar error legible
      const ya = await this.repo.findOne({
        where: { correoUsuario: correo },
        select: ['codUsuario'] as any,
      });
      if (ya) throw new ConflictException('Correo ya registrado (duplicado)');

      // Hash fuerte siempre (argon2)
      const passHash = await argon2.hash(body.contrasenaUsuario);

      const entity = this.repo.create({
        nombreUsuario: body.nombreUsuario,
        apellidoUsuario: body.apellidoUsuario,
        cedulaUsuario: body.cedulaUsuario,
        nicknameUsuario: body.nicknameUsuario?.trim() ?? null,
        correoUsuario: correo,
        contrasenaUsuario: passHash,
        refreshTokenHash: null,
        tokenVersion: 0,
        // Relaciones: solo se mapea el ID, TypeORM resuelve la FK
        rol: { codRol: Number(body.codRol) } as any,
        cargo:
          body.codCargoUsuario != null
            ? ({ codCargoUsuario: Number(body.codCargoUsuario) } as any)
            : null,
      });

      const saved = await this.repo.save(entity);
      return this.toDTO(saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new ConflictException('Correo ya registrado (duplicado)');
      }
      if (e?.code === 'ER_NO_REFERENCED_ROW_2' || e?.errno === 1452) {
        throw new HttpException(
          'Rol/Cargo inválido (violación de FK)',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (e instanceof HttpException) throw e;
      throw new HttpException('Falla al registrar', HttpStatus.BAD_REQUEST);
    }
  }

  // ================== MODIFICAR (GENÉRICO) ==================

  /**
   * Modificación administrativa de usuarios.
   * Permite cambiar rol, cargo, correo y otros campos (incluida password).
   */
  async modificarUsuario(obj: ModificarUsuarioDto): Promise<UsuarioListDTO> {
    if (!obj.codUsuario) {
      throw new HttpException('codUsuario es requerido', HttpStatus.BAD_REQUEST);
    }

    const current = await this.repo.findOne({
      where: { codUsuario: obj.codUsuario },
      loadEagerRelations: false,
      relations: {},
    });
    if (!current) throw new NotFoundException('Usuario no encontrado');

    const nextCorreo = obj.correoUsuario
      ? obj.correoUsuario.trim().toLowerCase()
      : undefined;

    // Evita cambiar correo a uno ya usado por otro usuario
    if (nextCorreo && nextCorreo !== current.correoUsuario) {
      const yaExiste = await this.repo.findOne({
        where: { correoUsuario: nextCorreo },
        select: ['codUsuario'] as any,
      });
      if (yaExiste && yaExiste.codUsuario !== current.codUsuario) {
        throw new ConflictException('Correo ya registrado (duplicado)');
      }
    }

    const updates: Partial<Usuario> = {
      nombreUsuario: obj.nombreUsuario ?? current.nombreUsuario,
      apellidoUsuario: obj.apellidoUsuario ?? current.apellidoUsuario,
      cedulaUsuario: obj.cedulaUsuario ?? current.cedulaUsuario,
      nicknameUsuario:
        obj.nicknameUsuario !== undefined
          ? obj.nicknameUsuario?.trim() ?? null
          : current.nicknameUsuario,
      correoUsuario: nextCorreo ?? current.correoUsuario,
      // aquí se asume que si llega contrasenaUsuario ya viene hasheada o manejada aguas arriba
      contrasenaUsuario: obj.contrasenaUsuario ?? current.contrasenaUsuario,
      refreshTokenHash: current.refreshTokenHash,
      tokenVersion:
        obj.tokenVersion !== undefined ? obj.tokenVersion : current.tokenVersion,
      ...(obj.codRol ? { rol: { codRol: Number(obj.codRol) } as any } : {}),
      ...(obj.codCargoUsuario !== undefined
        ? {
            cargo:
              obj.codCargoUsuario != null
                ? ({ codCargoUsuario: Number(obj.codCargoUsuario) } as any)
                : null,
          }
        : {}),
    };

    const merged = this.repo.merge(current, updates);

    try {
      const saved = await this.repo.save(merged);
      return this.toDTO(saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new ConflictException('Correo ya registrado (duplicado)');
      }
      if (e?.code === 'ER_NO_REFERENCED_ROW_2' || e?.errno === 1452) {
        throw new HttpException(
          'Rol/Cargo inválido (violación de FK)',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException('No se actualiza', HttpStatus.BAD_REQUEST);
    }
  }

  // ================== MODIFICAR (YO MISMO) ==================

  /**
   * Edición de datos propios (perfil) sin tocar rol/cargo ni campos sensibles.
   */
  async updateSelf(
    codUsuario: number,
    obj: {
      nombreUsuario: string;
      apellidoUsuario: string;
      correoUsuario: string;
      cedulaUsuario: string;
      nicknameUsuario?: string | null;
    },
  ): Promise<UsuarioListDTO> {
    const current = await this.repo.findOne({ where: { codUsuario } });
    if (!current) throw new NotFoundException('Usuario no encontrado');

    const correo = obj.correoUsuario.trim().toLowerCase();
    if (correo !== current.correoUsuario) {
      const ya = await this.repo.findOne({
        where: { correoUsuario: correo },
        select: ['codUsuario'] as any,
      });
      if (ya && ya.codUsuario !== codUsuario) {
        throw new ConflictException('Correo ya registrado (duplicado)');
      }
    }

    const updates: Partial<Usuario> = {
      nombreUsuario: obj.nombreUsuario.trim(),
      apellidoUsuario: obj.apellidoUsuario.trim(),
      correoUsuario: correo,
      cedulaUsuario: obj.cedulaUsuario.trim(),
      nicknameUsuario:
        obj.nicknameUsuario !== undefined
          ? obj.nicknameUsuario?.trim() || null
          : current.nicknameUsuario,
    };

    const merged = this.repo.merge(current, updates);
    const saved = await this.repo.save(merged);
    return this.toDTO(saved);
  }

  // ================== BORRAR ==================

  /**
   * Borrado duro del usuario por ID.
   * No permite saber si tiene dependencias lógicas aguas arriba.
   */
  async borrarUsuario(codUsuario: number): Promise<{ ok: true }> {
    const r = await this.repo.delete({ codUsuario });
    if (!r.affected) throw new NotFoundException('Usuario no encontrado');
    return { ok: true };
  }

  // ---- usados por auth/perfil ----

  /**
   * Guarda el hash del refresh token actual del usuario.
   */
  async setRefreshTokenHash(codUsuario: number, hash: string) {
    await this.repo.update({ codUsuario }, { refreshTokenHash: hash });
  }

  /**
   * Limpia el refresh token y fuerza invalidar sesiones subiendo tokenVersion.
   */
  async clearRefreshTokenHash(codUsuario: number) {
    await this.repo.update({ codUsuario }, { refreshTokenHash: null });
    await this.incrementTokenVersion(codUsuario);
  }

  /**
   * Verifica un refresh token plano contra el hash almacenado (si existe).
   */
  async verifyRefreshToken(codUsuario: number, plainToken: string) {
    const u = await this.findById(codUsuario);
    if (!u || !u.refreshTokenHash) return false;
    return argon2.verify(u.refreshTokenHash, plainToken);
  }

  /**
   * Actualiza directamente el hash de la contraseña.
   */
  async updatePasswordHash(codUsuario: number, passwordHash: string) {
    await this.repo.update({ codUsuario }, { contrasenaUsuario: passwordHash });
  }

  /**
   * Incrementa la versión de token para invalidar JWT antiguos.
   */
  async incrementTokenVersion(codUsuario: number) {
    await this.repo.increment({ codUsuario }, 'tokenVersion', 1);
  }

  /**
   * Actualiza el nickname de un usuario (permitiendo null).
   */
  async updateNickname(codUsuario: number, nickname: string | null) {
    await this.repo.update({ codUsuario }, { nicknameUsuario: nickname });
    return this.findById(codUsuario);
  }

  /**
   * Cambio de contraseña seguro:
   * - Soporta contraseñas legacy en texto plano.
   * - Rehashea usando argon2.
   * - Incrementa tokenVersion para tumbar sesiones activas.
   */
  async changePassword(codUsuario: number, current: string, next: string) {
    const user = await this.findById(codUsuario);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    let matches = false;
    try {
      matches = await argon2.verify(user.contrasenaUsuario, current);
    } catch {
      // si el valor guardado no es un hash válido, probamos igualdad directa (legacy)
      matches = user.contrasenaUsuario === current;
    }

    if (!matches) {
      throw new HttpException(
        'Contraseña actual incorrecta',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newHash = await argon2.hash(next);
    await this.updatePasswordHash(codUsuario, newHash);
    await this.incrementTokenVersion(codUsuario);
    return { ok: true };
  }
}
