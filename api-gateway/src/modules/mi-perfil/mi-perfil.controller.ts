// src/modules/mi-perfil/mi-perfil.controller.ts

import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { mapAxiosError } from '../../common/http-proxy.util';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const RETOS_URL_CONFIG_KEY = 'RETOS_URL';
const DEFAULT_RETOS_BASE_URL = 'http://localhost:3550';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

@ApiTags('Mi Perfil')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@Controller('mi-perfil')
/**
 * Controller that exposes "mi perfil" endpoints
 * and forwards requests to the retos-service, preserving authentication.
 */
export class PerfilController {
  /**
   * Base URL of retos-service used by this gateway.
   */
  private readonly retosBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.retosBaseUrl =
      this.configService.get<string>(RETOS_URL_CONFIG_KEY) ??
      DEFAULT_RETOS_BASE_URL;
  }

  /**
   * Builds authorization headers from the incoming request to forward
   * the bearer token to retos-service.
   */
  private buildAuthHeaders(req: any): { Authorization: string } {
    return {
      Authorization: req.headers['authorization'] || '',
    };
  }

  /**
   * Builds the full URL to the retos-service endpoint.
   */
  private buildRetosUrl(path: string): string {
    return `${this.retosBaseUrl}${path}`;
  }

  // ===========================
  // GET /mi-perfil/resumen
  // ===========================
  @Get('resumen')
  @ApiOperation({
    summary: 'Get profile summary for the current user',
    description:
      'Returns basic user info, statistics (XP, level, streak, coins) and recent achievements for the authenticated user.',
  })
  async resumen(@Req() req: any): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          this.buildRetosUrl('/mi-perfil/resumen'),
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      /*
        Expected response shape (from retos-service):

        {
          usuario: {
            nombre: string;
            apellido: string;
            nickname: string | null;
            cedula: string;
            email: string;
            cargo: string | null;
          },
          stats: {
            racha: number;
            monedas: number;
            xp: number;
            nivel: number;
            xpEnNivel: number;
            faltante: number;
            xpPorNivel: number;
            progreso: number; // 0..1
          },
          logros: any[];
        }
      */
      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // PATCH /mi-perfil/datos
  // ===========================
  @Patch('datos')
  @ApiOperation({
    summary: 'Update basic profile data for the current user',
    description:
      'Allows the authenticated user to update their own name, email, ID number and optional nickname.',
  })
  @ApiBody({
    type: UpdateMyProfileDto,
    description:
      'Fields that can be updated on the current user profile',
  })
  async updateMyData(
    @Req() req: any,
    @Body() dto: UpdateMyProfileDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(
          this.buildRetosUrl('/mi-perfil/datos'),
          dto,
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // PATCH /mi-perfil/nickname
  // ===========================
  @Patch('nickname')
  @ApiOperation({
    summary: 'Update the nickname of the current user',
    description:
      'Updates only the nickname field for the authenticated user.',
  })
  @ApiBody({
    type: UpdateNicknameDto,
    description: 'New nickname to be set for the current user',
  })
  async updateNickname(
    @Req() req: any,
    @Body() dto: UpdateNicknameDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(
          this.buildRetosUrl('/mi-perfil/nickname'),
          dto,
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }

  // ===========================
  // PATCH /mi-perfil/password
  // ===========================
  @Patch('password')
  @ApiOperation({
    summary: 'Change the password of the current user',
    description:
      'Validates the current password and, if correct, replaces it with the provided new password.',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description:
      'Current and new password for the authenticated user',
  })
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(
          this.buildRetosUrl('/mi-perfil/password'),
          dto,
          {
            headers: this.buildAuthHeaders(req),
          },
        ),
      );

      return data;
    } catch (e) {
      mapAxiosError(e);
    }
  }
}
