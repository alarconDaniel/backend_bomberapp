import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Archivo } from '../../../models/archivo/archivo';
import { Usuario } from '../../../models/usuario/usuario';
import { ArchivoService } from './archivo.service';
import { ArchivoController } from './archivo.controller';



@Module({
  controllers: [ArchivoController],
  imports: [
    TypeOrmModule.forFeature([Archivo, Usuario]),          
  ],
  providers: [ArchivoService],
  exports: [ArchivoService],
})
export class ArchivoModule {}
