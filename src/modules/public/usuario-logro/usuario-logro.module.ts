import { Module } from '@nestjs/common';
import { UsuarioLogroController } from './usuario-logro.controller';
import { UsuarioLogroService } from './usuario-logro.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  controllers: [UsuarioLogroController],
  providers: [UsuarioLogroService],
  exports: [UsuarioLogroService],
})
export class UsuarioLogroModule {}
