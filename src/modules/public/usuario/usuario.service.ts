import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from 'src/models/usuario/usuario';
import { Rol } from 'src/models/rol/rol';
import { CargoUsuario } from 'src/models/cargo_usuario/cargo-usuario';
import * as argon2 from 'argon2';

export interface CrearUsuarioInput {
  nombreUsuario: string;
  apellidoUsuario: string;
  correoUsuario: string;
  codCargoUsuario?: number | null; // <-- opcional
  codRol: number;
  password: string; // el admin la define
}

@Injectable()
export class UsuarioService {
  private repo: Repository<Usuario>;
  private rolRepo: Repository<Rol>;
  private cargoRepo: Repository<CargoUsuario>;

  constructor(private poolConexion: DataSource) {
    this.repo = this.poolConexion.getRepository(Usuario);
    this.rolRepo = this.poolConexion.getRepository(Rol);
    this.cargoRepo = this.poolConexion.getRepository(CargoUsuario);
  }

  async findById(codUsuario: number): Promise<Usuario | null> {
    return this.repo.findOne({
      where: { codUsuario },
      relations: ['rol', 'cargo', 'estadisticas'], // opcional; deja las que uses
    });
  }

  async findByCorreo(correo: string) {
    return this.repo.findOne({ where: { correoUsuario: correo } });
  }

  async setRefreshTokenHash(codUsuario: number, hash: string | null) {
    await this.repo.update({ codUsuario }, { refreshTokenHash: hash });
  }

  async incrementTokenVersion(codUsuario: number) {
    const user = await this.repo.findOne({ where: { codUsuario } });
    if (!user) return;
    await this.repo.update(
      { codUsuario },
      { tokenVersion: (user.tokenVersion ?? 0) + 1, refreshTokenHash: null },
    );
  }

  async updatePasswordHash(codUsuario: number, passwordHash: string) {
    await this.repo.update({ codUsuario }, { contrasenaUsuario: passwordHash });
  }

  async crearUsuario(data: CrearUsuarioInput) {
    // 1) Validación básica password
    if (!data.password || data.password.trim().length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    // 2) Correo único
    const existente = await this.findByCorreo(data.correoUsuario);
    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    // 3) Validar rol existente
    const rol = await this.rolRepo.findOne({ where: { codRol: data.codRol } });
    if (!rol) {
      throw new NotFoundException('El rol especificado no existe');
    }

    // 4) Validar cargo si viene (puede ser null/undefined)
    let cargo: CargoUsuario | null = null;
    if (data.codCargoUsuario !== undefined && data.codCargoUsuario !== null) {
      cargo = await this.cargoRepo.findOne({ where: { codCargoUsuario: data.codCargoUsuario } });
      if (!cargo) {
        throw new NotFoundException('El cargo especificado no existe');
      }
    }

    // 5) Hash argon2id
    const hash = await argon2.hash(data.password.trim(), { type: argon2.argon2id });

    // 6) Crear usuario con RELACIONES (no campos planos)
    const nuevo = this.repo.create({
      nombreUsuario: data.nombreUsuario,
      apellidoUsuario: data.apellidoUsuario,
      correoUsuario: data.correoUsuario,
      contrasenaUsuario: hash,
      refreshTokenHash: null,
      tokenVersion: 0,
      rol,                   // ManyToOne Rol
      cargo: cargo ?? null,  // ManyToOne Cargo (nullable)
    });

    const saved = await this.repo.save(nuevo);

    // 7) Respuesta sin datos sensibles
    return {
      codUsuario: saved.codUsuario,
      correoUsuario: saved.correoUsuario,
      nombreUsuario: saved.nombreUsuario,
      apellidoUsuario: saved.apellidoUsuario,
      codRol: saved.rol?.codRol,                          // desde la relación
      codCargoUsuario: saved.cargo?.codCargoUsuario ?? null,
    };
  }
  
  /** Limpia el hash del refresh token del usuario (logout server-side). */
  async clearRefreshTokenHash(codUsuario: number) {
    await this.repo.update({ codUsuario }, { refreshTokenHash: null });
  }

  /** Verifica que el refresh entrante coincide con el hash guardado. */
  async verifyRefreshToken(codUsuario: number, refreshRaw: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { codUsuario } });
    if (!user?.refreshTokenHash) return false;
    try {
      return await argon2.verify(user.refreshTokenHash, refreshRaw);
    } catch {
      return false;
    }
  }
}
