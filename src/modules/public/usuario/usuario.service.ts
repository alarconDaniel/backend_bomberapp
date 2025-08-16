import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/models/usuario/usuario';
import { DataSource, Repository } from 'typeorm';
import * as argon2 from 'argon2';

export interface CrearUsuarioInput {
  nombreUsuario: string;
  apellidoUsuario: string;
  correoUsuario: string;
  cargoUsuario: string;
  codRol: number;
  password: string; // el admin la define
}

@Injectable()
export class UsuarioService {
   private repo: Repository<Usuario>;

  constructor(private poolConexion: DataSource) {
    this.repo = this.poolConexion.getRepository(Usuario);
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
    // validación básica
    if (!data.password || data.password.trim().length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    const existente = await this.findByCorreo(data.correoUsuario);
    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    // hash argon2id (incluye salt aleatorio)
    const hash = await argon2.hash(data.password.trim(), { type: argon2.argon2id });

    const nuevo = this.repo.create({
      nombreUsuario: data.nombreUsuario,
      apellidoUsuario: data.apellidoUsuario,
      correoUsuario: data.correoUsuario,
      contrasenaUsuario: hash,  // 👈 guardar SOLO el hash
      cargoUsuario: data.cargoUsuario,
      codRol: data.codRol,      // tu PK compuesta incluye cod_rol
      refreshTokenHash: null,
      tokenVersion: 0,
    });

    const saved = await this.repo.save(nuevo);

    // devuelve datos no sensibles (jamás la contraseña ni el hash)
    return {
      codUsuario: saved.codUsuario,
      correoUsuario: saved.correoUsuario,
      nombreUsuario: saved.nombreUsuario,
      apellidoUsuario: saved.apellidoUsuario,
      cargoUsuario: saved.cargoUsuario,
      codRol: saved.codRol,
    };
  }
}
