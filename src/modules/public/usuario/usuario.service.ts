// src/services/usuario/usuario.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from 'src/models/usuario/usuario';

@Injectable()
export class UsuarioService {
  private usuarioRepository: Repository<Usuario>;

  constructor(private poolConexion: DataSource) {
    this.usuarioRepository = poolConexion.getRepository(Usuario);
  }

  // GET: listar
  public async listarUsuarios(): Promise<Usuario[]> {
    return await this.usuarioRepository.find();
  }

  // GET: detalle por id
  public async buscarUsuario(codUsuario: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ codUsuario });
    if (!usuario) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    return usuario;
  }

  // POST: crear
  public async crearUsuario(objUsuario: Usuario): Promise<Usuario> {
    try {
      return await this.usuarioRepository.save(objUsuario);
    } catch (err: any) {
      // Manejo de correo duplicado (MySQL)
      if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
        throw new HttpException('Correo ya registrado', HttpStatus.CONFLICT);
      }
      throw new HttpException('Falla al registrar', HttpStatus.BAD_REQUEST);
    }
  }

  // PUT: actualizar
  public async modificarUsuario(objActualizar: Usuario): Promise<any> {
    try {
      if (!objActualizar.codUsuario) {
        throw new HttpException('codUsuario es requerido', HttpStatus.BAD_REQUEST);
      }
      const { codUsuario } = objActualizar;
      const result = await this.usuarioRepository.update({ codUsuario }, objActualizar);

      if (result.affected === 0) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }
      return result; 
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
        throw new HttpException('Correo ya registrado', HttpStatus.CONFLICT);
      }
      throw new HttpException('No se actualiza', HttpStatus.BAD_REQUEST);
    }
  }

  // DELETE: borrar
  public async borrarUsuario(codUsuario: number): Promise<any> {
    try {
      const result = await this.usuarioRepository.delete({ codUsuario });
      if (result.affected === 0) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }
      return result; 
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('No se borra', HttpStatus.BAD_REQUEST);
    }
  }
}
