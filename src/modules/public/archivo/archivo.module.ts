import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Archivo } from '../../../models/archivo/archivo';
import { Usuario } from '../../../models/usuario/usuario';
import { ArchivoService } from './archivo.service';

// ⬇️ importa el módulo que expone GoogleDriveOAuthService
// ajusta el nombre/ruta si en tu proyecto se llama distinto
import { GoogleDriveOAuthModule } from '../google-token/google-token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Archivo, Usuario]), 
    forwardRef(() => GoogleDriveOAuthModule),          
  ],
  providers: [ArchivoService],
  exports: [ArchivoService],
})
export class ArchivoModule {}
