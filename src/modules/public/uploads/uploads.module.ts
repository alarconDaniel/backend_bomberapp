// src/modules/public/uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { ArchivoService } from '../archivo/archivo.service';
import { Archivo } from 'src/models/archivo/archivo';
import { Usuario } from 'src/models/usuario/usuario';

@Module({
  imports: [TypeOrmModule.forFeature([Archivo, Usuario])],
  controllers: [UploadsController],
  providers: [UploadsService, ArchivoService],
  exports: [UploadsService],
})
export class UploadsModule {}
