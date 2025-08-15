// auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    const tokens = await this.auth.signTokens(user.id, user.email);
    return { user: { id: user.id, email: user.email }, ...tokens };
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    // valida y rota refresh token (ideal: guarda hash en DB y compara)
    // devuelve nuevo par access/refresh
  }
}
