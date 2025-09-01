// src/modules/public/google-token/google-drive-oauth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleToken } from 'src/models/google-token/google-token';

@Injectable()
export class GoogleDriveOAuthService {
  constructor(@InjectRepository(GoogleToken) private repo: Repository<GoogleToken>) {}

  private makeClient() {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT!;
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  // ⬇⬇⬇  AHORA acepta codUsuario y lo pone en "state"
  getAuthUrl(codUsuario: number) {
    const client = this.makeClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/drive.file'],
      state: String(codUsuario), // importante para identificar a quién guardar
    });
  }

  async handleCallback(code: string, codUsuario: number) {
    const client = this.makeClient();
    const { tokens } = await client.getToken(code);

    const prev = await this.repo.findOne({ where: { codUsuario } });
    await this.repo.save(
      this.repo.create({
        id: prev?.id,
        codUsuario,
        accessToken: tokens.access_token ?? prev?.accessToken ?? null,
        refreshToken: tokens.refresh_token ?? prev?.refreshToken ?? null,
        scope: tokens.scope ?? prev?.scope ?? null,
        tokenType: tokens.token_type ?? prev?.tokenType ?? null,
        expiryDate: tokens.expiry_date ?? prev?.expiryDate ?? null,
      }),
    );
    return { ok: true };
  }

  async getDriveForUser(codUsuario: number): Promise<drive_v3.Drive> {
    const row = await this.repo.findOne({ where: { codUsuario } });
    if (!row?.refreshToken) throw new UnauthorizedException('Conecta tu cuenta de Google primero.');

    const client = this.makeClient();
    client.setCredentials({
      access_token: row.accessToken ?? undefined,
      refresh_token: row.refreshToken ?? undefined,
      expiry_date: row.expiryDate ?? undefined,
      token_type: row.tokenType ?? undefined,
      scope: row.scope ?? undefined,
    });

    client.on('tokens', async (t) => {
      await this.repo.save({
        ...row,
        accessToken: t.access_token ?? row.accessToken,
        refreshToken: t.refresh_token ?? row.refreshToken,
        scope: t.scope ?? row.scope,
        tokenType: t.token_type ?? row.tokenType,
        expiryDate: t.expiry_date ?? row.expiryDate,
      });
    });

    return google.drive({ version: 'v3', auth: client });
  }

  getDrive(codUsuario: number) {
    return this.getDriveForUser(codUsuario);
  }
}
