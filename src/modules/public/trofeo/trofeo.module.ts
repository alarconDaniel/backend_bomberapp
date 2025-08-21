import { Module } from '@nestjs/common';
import { TrofeoController } from './trofeo.controller';
import { TrofeoService } from './trofeo.service';
import { ConexionModule } from 'src/config/conexion/conexion.module';

@Module({
  imports:[ConexionModule],
  controllers: [TrofeoController],
  providers: [TrofeoService],
  exports: [TrofeoModule]
})
export class TrofeoModule {}
