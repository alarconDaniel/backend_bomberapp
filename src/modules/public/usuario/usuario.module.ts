import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/models/usuario/usuario';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [
    ConexionModule,                 // tu forRoot(...)
    TypeOrmModule.forFeature([Usuario]), // registra el repo de Usuario
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
