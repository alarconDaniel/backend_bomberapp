import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Archivo } from 'src/models/archivo/archivo';
import { Usuario } from 'src/models/usuario/usuario';
import { ArchivoService } from './archivo.service';
import { ArchivoController } from './archivo.controller';
import { GoogleDriveOAuthModule } from '../google-token/google-token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Archivo, Usuario]),
    GoogleDriveOAuthModule, // módulo que exporta GoogleDriveOAuthService
  ],
  controllers: [ArchivoController],
  providers: [ArchivoService],
  exports: [ArchivoService],
})
export class ArchivoModule {}
