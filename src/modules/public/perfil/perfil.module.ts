import { Module } from '@nestjs/common';
import { PerfilController } from './perfil.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { EstadisticaUsuarioModule } from '../estadistica-usuario/estadistica-usuario.module';
import { UsuarioLogroModule } from '../usuario-logro/usuario-logro.module';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { PerfilService } from './perfil.service';

@Module({
  imports: [ConexionModule, UsuarioModule, EstadisticaUsuarioModule, UsuarioLogroModule],
  controllers: [PerfilController],
  providers: [PerfilService],
})
export class PerfilModule {}
