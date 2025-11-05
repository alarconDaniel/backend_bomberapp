import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USERS_CLIENT, UsersClientConfig } from '../config/users-client.config';

export interface RemoteUsuario {
  id: number;
  email: string;
  role: string;
  [key: string]: any;
}

@Injectable()
export class UsersClientService {
  private readonly logger = new Logger(UsersClientService.name);
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(configService: ConfigService) {
    const cfg = configService.get<UsersClientConfig>(USERS_CLIENT);
    if (!cfg) {
      throw new Error('UsersClientConfig no encontrado');
    }
    this.baseUrl = cfg.baseUrl.endsWith('/') ? cfg.baseUrl : `${cfg.baseUrl}/`;
    this.timeout = cfg.timeout;
  }

  async validateCredentials(email: string, password: string): Promise<RemoteUsuario | null> {
    return this.request<RemoteUsuario>(
      'internal/users/validate',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      { returnNullOn401: true, returnNullOn404: true },
    );
  }

  async findByEmail(email: string): Promise<RemoteUsuario | null> {
    return this.request<RemoteUsuario>(
      `internal/users/by-email?${new URLSearchParams({ email }).toString()}`,
      { method: 'GET' },
      { returnNullOn404: true },
    );
  }

  async findById(id: number): Promise<RemoteUsuario | null> {
    return this.request<RemoteUsuario>(`internal/users/${id}`, { method: 'GET' }, { returnNullOn404: true });
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    await this.request(
      `internal/users/${userId}/password`,
      {
        method: 'PATCH',
        body: JSON.stringify({ password: newPassword }),
      },
      {},
    );
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    options: { returnNullOn404?: boolean; returnNullOn401?: boolean },
  ): Promise<T | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const url = new URL(path, this.baseUrl).toString();
    const headers = new Headers(init.headers ?? {});
    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        return this.handleError(response, options);
      }

      if (response.status === 204) {
        return null;
      }

      const text = await response.text();
      if (!text) {
        return null;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new ServiceUnavailableException('Servicio de usuarios no respondió a tiempo');
      }
      this.logger.error('Error inesperado contactando servicio de usuarios', error as Error);
      throw new ServiceUnavailableException('Servicio de usuarios no disponible temporalmente');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private handleError<T>(
    response: Response,
    options: { returnNullOn404?: boolean; returnNullOn401?: boolean },
  ): T | null {
    if (response.status === 404) {
      if (options.returnNullOn404) {
        return null;
      }
      throw new NotFoundException('Usuario no encontrado en servicio remoto');
    }

    if (response.status === 401) {
      if (options.returnNullOn401) {
        return null;
      }
      throw new UnauthorizedException('Operación no autorizada en servicio de usuarios');
    }

    this.logger.error(`Error ${response.status} desde servicio de usuarios`, {
      url: response.url,
      statusText: response.statusText,
    });
    throw new ServiceUnavailableException('Servicio de usuarios no disponible. Intenta más tarde.');
  }
}
