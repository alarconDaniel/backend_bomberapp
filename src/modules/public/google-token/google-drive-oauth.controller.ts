import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { GoogleDriveOAuthService } from './google-drive-oauth.service';

@Controller('google-token')
export class GoogleDriveOAuthController {
  constructor(private readonly svc: GoogleDriveOAuthService) {}

  // PROTEGIDO: usa JWT y fija state=codUsuario
  @UseGuards(AuthGuard('jwt'))
  @Get('connect')
  connect(@Req() req: Request) {
    const user: any = (req as any).user;
    const codUsuario = Number(user?.sub ?? 0);
    const url = this.svc.getAuthUrl(codUsuario);
    return { url };
  }

  // PÚBLICO: Google llega sin Authorization
  @Public()
  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state?: string) {
    const codUsuario = Number(state ?? 0);
    if (!code || !codUsuario) return { ok: false, error: 'code/state faltante' };
    await this.svc.handleCallback(code, codUsuario);
    return { ok: true };
  }
}
