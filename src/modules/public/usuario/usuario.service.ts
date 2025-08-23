import {
  ConflictException, HttpException, HttpStatus,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from 'src/models/usuario/usuario';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // LISTAR: selecciona solo columnas que EXISTEN en tu tabla
  public listarUsuarios(): Promise<Partial<Usuario>[]> {
    return this.usuarioRepository.find({
      select: [
        'codUsuario',
        'nombreUsuario',
        'apellidoUsuario',
        'correoUsuario',
        'nicknameUsuario',
        'cedulaUsuario',
      ],
      order: { codUsuario: 'ASC' },
    });
  }

  // DETALLE: idem con select
  public async buscarUsuario(codUsuario: number): Promise<Partial<Usuario>> {
    const u = await this.usuarioRepository.findOne({
      where: { codUsuario },
      select: [
        'codUsuario',
        'nombreUsuario',
        'apellidoUsuario',
        'correoUsuario',
        'nicknameUsuario',
        'cedulaUsuario',
      ],
    });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  // CREAR: normaliza y devuelve sin campos sensibles
  public async crearUsuario(objUsuario: Usuario): Promise<Partial<Usuario>> {
    try {
      if (objUsuario.correoUsuario) objUsuario.correoUsuario = objUsuario.correoUsuario.trim().toLowerCase();
      if (objUsuario.nicknameUsuario) objUsuario.nicknameUsuario = objUsuario.nicknameUsuario.trim();

      const saved = await this.usuarioRepository.save(objUsuario);
      const { contrasenaUsuario, refreshTokenHash, ...safe } = saved as any;
      return safe;
    } catch (err: any) {
      if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
        throw new ConflictException('Correo/Nickname/Cédula ya registrado');
      }
      throw new HttpException('Falla al registrar', HttpStatus.BAD_REQUEST);
    }
  }

  // MODIFICAR: usa preload+save para que corran hooks y valide existencia
  public async modificarUsuario(objActualizar: Usuario): Promise<Partial<Usuario>> {
    if (!objActualizar.codUsuario) {
      throw new HttpException('codUsuario es requerido', HttpStatus.BAD_REQUEST);
    }
    try {
      const merged = await this.usuarioRepository.preload(objActualizar as any);
      if (!merged) throw new NotFoundException('Usuario no encontrado');

      if (merged.correoUsuario) merged.correoUsuario = merged.correoUsuario.trim().toLowerCase();
      if (merged.nicknameUsuario) merged.nicknameUsuario = merged.nicknameUsuario.trim();

      const saved = await this.usuarioRepository.save(merged);
      const { contrasenaUsuario, refreshTokenHash, ...safe } = saved as any;
      return safe;
    } catch (err: any) {
      if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
        throw new ConflictException('Correo/Nickname/Cédula ya registrado');
      }
      if (err instanceof HttpException) throw err;
      throw new HttpException('No se actualiza', HttpStatus.BAD_REQUEST);
    }
  }

  // BORRAR
  public async borrarUsuario(codUsuario: number): Promise<{ ok: true }> {
    const r = await this.usuarioRepository.delete({ codUsuario });
    if (!r.affected) throw new NotFoundException('Usuario no encontrado');
    return { ok: true };
  }
}
