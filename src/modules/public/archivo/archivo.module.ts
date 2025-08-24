import { Module } from '@nestjs/common';
import { ArchivoService } from './archivo.service';
import { ArchivoController } from './archivo.controller';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],           
  controllers: [ArchivoController],
  providers: [ArchivoService],          
  exports: [ArchivoService],
})
export class ArchivoModule {}
