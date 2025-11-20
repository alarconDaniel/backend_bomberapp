import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Usuario } from 'src/models/usuario/usuario';

/**
 * Module that encapsulates user-related HTTP endpoints and persistence layer.
 * Uses TypeOrmModule.forFeature to register the Usuario repository.
 */
@Module({
  // ConexionModule is global and already configured at the root level,
  // so it is not required here. Only the entity repository is imported.
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
