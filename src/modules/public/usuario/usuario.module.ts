import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
// Si NO usas @Global en ConexionModule, importa aquí:
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule], // ← solo si NO marcaste @Global
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
