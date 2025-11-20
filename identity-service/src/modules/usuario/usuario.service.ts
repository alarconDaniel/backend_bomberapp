// src/modules/usuario/usuario.service.ts
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { Usuario } from 'src/models/usuario/usuario';
import { CrearUsuarioDto } from 'src/modules/usuario/dto/crear-usuario.dto';
import { ModificarUsuarioDto } from 'src/modules/usuario/dto/modificar-usuario.dto';

type UsuarioListDTO = {
  codUsuario: number;
  codRol: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  cedulaUsuario: string;
  nicknameUsuario: string | null;
  correoUsuario: string;
  tokenVersion: number;
};

// Reused user-facing messages (kept in Spanish to preserve API behavior)
const USER_NOT_FOUND_MESSAGE = 'Usuario no encontrado';
const DUPLICATE_EMAIL_MESSAGE = 'Correo ya registrado (duplicado)';
const COD_ROL_REQUIRED_MESSAGE = 'codRol es requerido';
const PASSWORD_REQUIRED_MESSAGE = 'contrasenaUsuario es requerida';
const ROLE_INVALID_MESSAGE = 'Rol inválido (violación de FK)';
const REGISTER_FAIL_MESSAGE = 'Falla al registrar';
const UPDATE_FAIL_MESSAGE = 'No se actualiza';
const CURRENT_PASSWORD_INCORRECT_MESSAGE = 'Contraseña actual incorrecta';

/**
 * Service responsible for user management:
 * listing, lookup, creation, update, deletion and
 * refresh-token / password lifecycle operations.
 */
@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Maps a Usuario entity into a light-weight DTO
   * used for external responses.
   */
  private toDTO(usuario: Usuario): UsuarioListDTO {
    return {
      codUsuario: usuario.codUsuario,
      codRol: usuario.codRol,
      nombreUsuario: usuario.nombreUsuario,
      apellidoUsuario: usuario.apellidoUsuario,
      cedulaUsuario: usuario.cedulaUsuario,
      nicknameUsuario: usuario.nicknameUsuario ?? null,
      correoUsuario: usuario.correoUsuario,
      tokenVersion: usuario.tokenVersion,
    };
  }

  async listarUsuarios(): Promise<UsuarioListDTO[]> {
    const rows = await this.usuarioRepository.find({
      loadEagerRelations: false,
      relations: {},
      order: { codUsuario: 'ASC' },
    });
    return rows.map((usuario) => this.toDTO(usuario));
  }

  async buscarUsuario(codUsuario: number): Promise<UsuarioListDTO> {
    const usuario = await this.usuarioRepository.findOne({
      where: { codUsuario },
      loadEagerRelations: false,
      relations: {},
    });

    if (!usuario) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    return this.toDTO(usuario);
  }

  // ===== Utility lookups used by other services / auth layer =====

  async findById(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { codUsuario: id } });
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { correoUsuario: correo.toLowerCase() },
    });
  }

  // ================== CREATE ==================

  async crearUsuario(body: CrearUsuarioDto): Promise<UsuarioListDTO> {
    try {
      if (!body.codRol) {
        throw new HttpException(COD_ROL_REQUIRED_MESSAGE, HttpStatus.BAD_REQUEST);
      }

      if (!body.contrasenaUsuario?.trim()) {
        throw new HttpException(
          PASSWORD_REQUIRED_MESSAGE,
          HttpStatus.BAD_REQUEST,
        );
      }

      const correoNormalizado = body.correoUsuario.trim().toLowerCase();

      const existing = await this.usuarioRepository.findOne({
        where: { correoUsuario: correoNormalizado },
        select: ['codUsuario'] as any,
      });

      if (existing) {
        throw new ConflictException(DUPLICATE_EMAIL_MESSAGE);
      }

      // Always store a hashed password for new users.
      const passwordHash = await argon2.hash(body.contrasenaUsuario);

      const entity = this.usuarioRepository.create({
        nombreUsuario: body.nombreUsuario,
        apellidoUsuario: body.apellidoUsuario,
        cedulaUsuario: body.cedulaUsuario,
        nicknameUsuario: body.nicknameUsuario?.trim() ?? null,
        correoUsuario: correoNormalizado,
        contrasenaUsuario: passwordHash,
        refreshTokenHash: null,
        tokenVersion: 0,
        // Role relation (Usuario has ManyToOne -> Rol)
        rol: { codRol: Number(body.codRol) } as any,
      });

      const saved = await this.usuarioRepository.save(entity);
      return this.toDTO(saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new ConflictException(DUPLICATE_EMAIL_MESSAGE);
      }
      if (e?.code === 'ER_NO_REFERENCED_ROW_2' || e?.errno === 1452) {
        throw new HttpException(
          ROLE_INVALID_MESSAGE,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(REGISTER_FAIL_MESSAGE, HttpStatus.BAD_REQUEST);
    }
  }

  // ================== UPDATE (GENERIC) ==================

  async modificarUsuario(obj: ModificarUsuarioDto): Promise<UsuarioListDTO> {
    if (!obj.codUsuario) {
      throw new HttpException(
        'codUsuario es requerido',
        HttpStatus.BAD_REQUEST,
      );
    }

    const current = await this.usuarioRepository.findOne({
      where: { codUsuario: obj.codUsuario },
      loadEagerRelations: false,
      relations: {},
    });

    if (!current) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    const nextCorreo = obj.correoUsuario
      ? obj.correoUsuario.trim().toLowerCase()
      : undefined;

    if (nextCorreo && nextCorreo !== current.correoUsuario) {
      const alreadyExists = await this.usuarioRepository.findOne({
        where: { correoUsuario: nextCorreo },
        select: ['codUsuario'] as any,
      });

      if (alreadyExists && alreadyExists.codUsuario !== current.codUsuario) {
        throw new ConflictException(DUPLICATE_EMAIL_MESSAGE);
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
      contrasenaUsuario: obj.contrasenaUsuario ?? current.contrasenaUsuario,
      refreshTokenHash: current.refreshTokenHash,
      tokenVersion:
        obj.tokenVersion !== undefined
          ? obj.tokenVersion
          : current.tokenVersion,
      ...(obj.codRol
        ? { rol: { codRol: Number(obj.codRol) } as any }
        : {}),
      // There is no cargo field in the current entity, so all codCargoUsuario
      // related logic has been intentionally removed.
    };

    const merged = this.usuarioRepository.merge(current, updates);

    try {
      const saved = await this.usuarioRepository.save(merged);
      return this.toDTO(saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062) {
        throw new ConflictException(DUPLICATE_EMAIL_MESSAGE);
      }
      if (e?.code === 'ER_NO_REFERENCED_ROW_2' || e?.errno === 1452) {
        throw new HttpException(
          ROLE_INVALID_MESSAGE,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(UPDATE_FAIL_MESSAGE, HttpStatus.BAD_REQUEST);
    }
  }

  // ================== UPDATE (SELF PROFILE) ==================

  /**
   * Updates the profile of the currently authenticated user.
   * Only profile fields are allowed; credentials and role are not modified here.
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
    const current = await this.usuarioRepository.findOne({ where: { codUsuario } });

    if (!current) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    const normalizedEmail = obj.correoUsuario.trim().toLowerCase();

    if (normalizedEmail !== current.correoUsuario) {
      const existing = await this.usuarioRepository.findOne({
        where: { correoUsuario: normalizedEmail },
        select: ['codUsuario'] as any,
      });

      if (existing && existing.codUsuario !== codUsuario) {
        throw new ConflictException(DUPLICATE_EMAIL_MESSAGE);
      }
    }

    const updates: Partial<Usuario> = {
      nombreUsuario: obj.nombreUsuario.trim(),
      apellidoUsuario: obj.apellidoUsuario.trim(),
      correoUsuario: normalizedEmail,
      cedulaUsuario: obj.cedulaUsuario.trim(),
      nicknameUsuario:
        obj.nicknameUsuario !== undefined
          ? obj.nicknameUsuario?.trim() || null
          : current.nicknameUsuario,
    };

    const merged = this.usuarioRepository.merge(current, updates);
    const saved = await this.usuarioRepository.save(merged);
    return this.toDTO(saved);
  }

  // ================== DELETE ==================

  async borrarUsuario(codUsuario: number): Promise<{ ok: true }> {
    const result = await this.usuarioRepository.delete({ codUsuario });

    if (!result.affected) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    return { ok: true };
  }

  // ===== Methods used by auth/profile flows =====

  /**
   * Stores the hashed refresh token for the given user.
   */
  async setRefreshTokenHash(codUsuario: number, hash: string): Promise<void> {
    await this.usuarioRepository.update({ codUsuario }, { refreshTokenHash: hash });
  }

  /**
   * Clears the stored refresh token hash and increments tokenVersion,
   * effectively invalidating previously issued refresh tokens.
   */
  async clearRefreshTokenHash(codUsuario: number): Promise<void> {
    await this.usuarioRepository.update(
      { codUsuario },
      { refreshTokenHash: null },
    );
    await this.incrementTokenVersion(codUsuario);
  }

  /**
   * Verifies a plain refresh token against the stored hash, if present.
   */
  async verifyRefreshToken(
    codUsuario: number,
    plainToken: string,
  ): Promise<boolean> {
    const usuario = await this.findById(codUsuario);
    if (!usuario || !usuario.refreshTokenHash) {
      return false;
    }
    return argon2.verify(usuario.refreshTokenHash, plainToken);
  }

  async updatePasswordHash(
    codUsuario: number,
    passwordHash: string,
  ): Promise<void> {
    await this.usuarioRepository.update(
      { codUsuario },
      { contrasenaUsuario: passwordHash },
    );
  }

  async incrementTokenVersion(codUsuario: number): Promise<void> {
    await this.usuarioRepository.increment(
      { codUsuario },
      'tokenVersion',
      1,
    );
  }

  async updateNickname(
    codUsuario: number,
    nickname: string | null,
  ): Promise<Usuario | null> {
    await this.usuarioRepository.update(
      { codUsuario },
      { nicknameUsuario: nickname },
    );
    return this.findById(codUsuario);
  }

  /**
   * Changes the password for a user, supporting both legacy plain-text
   * and Argon2-hashed passwords.
   */
  async changePassword(
    codUsuario: number,
    current: string,
    next: string,
  ): Promise<{ ok: true }> {
    const user = await this.findById(codUsuario);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    let matches = false;

    try {
      matches = await argon2.verify(user.contrasenaUsuario, current);
    } catch {
      // If the stored value is not a valid hash, fall back to plain-text comparison (legacy behavior).
      matches = user.contrasenaUsuario === current;
    }

    if (!matches) {
      throw new HttpException(
        CURRENT_PASSWORD_INCORRECT_MESSAGE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const newHash = await argon2.hash(next);
    await this.updatePasswordHash(codUsuario, newHash);
    await this.incrementTokenVersion(codUsuario);

    return { ok: true };
  }
}
