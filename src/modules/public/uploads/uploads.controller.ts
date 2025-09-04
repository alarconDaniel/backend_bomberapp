import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UploadsService } from './uploads.service';

@UseGuards(AuthGuard('jwt'))
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Get('presign')
  async presign(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
    @Query('codUsuario') codUsuario: string,
  ) {
    return this.uploads.createSignedUploadUrl({
      filename,
      contentType,
      codUsuario: Number(codUsuario),
    });
  }
}
