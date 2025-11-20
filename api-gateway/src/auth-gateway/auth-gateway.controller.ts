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
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO used to authenticate a user against the identity-service.
 */
class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'StrongP4ssw0rd', minLength: 8 })
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthGatewayController {
  /**
   * Base URL of the identity-service used by this gateway.
   * Falls back to a local URL for development environments.
   */
  private readonly identityBase: string;

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {
    this.identityBase = this.cfg.get<string>('IDENTITY_URL') || 'http://localhost:8090';
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user against identity-service' })
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
  @ApiOperation({ summary: 'Refresh access and refresh tokens using identity-service' })
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
  @ApiOperation({ summary: 'Return the current JWT payload associated with the request' })
  async me(@CurrentUser() user: any) {
    // We do not need to call the identity microservice; the payload already lives in the token.
    return user;
  }

  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'Logout by invalidating the refresh token in identity-service',
  })
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
