// src/auth/auth.gateway.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { mapAxiosError } from 'src/common/http-proxy.util';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

class LoginDto {
  email: string;
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthGatewayController {
  private readonly identityBase: string;

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {
    this.identityBase = this.cfg.get<string>('IDENTITY_URL') || 'http://localhost:8090';
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login contra identity-service' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.identityBase}/auth/login`, body),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refrescar access/refresh token' })
  async refresh(@Body() body: { refresh_token: string }) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.identityBase}/auth/refresh`, body),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  @Get('me')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Ver payload del token actual' })
  async me(@CurrentUser() user: any) {
    // ni siquiera necesitamos ir al microservicio; el payload ya está en el token
    return user;
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout (invalidar refresh token) en identity-service' })
  async logout(@Body() body: { refresh_token: string }) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.identityBase}/auth/logout`, body),
      );
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
