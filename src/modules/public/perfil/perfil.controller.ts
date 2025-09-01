// perfil.controller.ts
import { Body, Controller, Get, NotFoundException, Patch } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UsuarioService } from '../usuario/usuario.service';
import { EstadisticaUsuarioService } from '../estadistica-usuario/estadistica-usuario.service';
import { ConfigService } from '@nestjs/config';
import { UsuarioLogroService } from '../usuario-logro/usuario-logro.service';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('mi-perfil')
export class PerfilController {
  constructor(
    private readonly usuarios: UsuarioService,
    private readonly stats: EstadisticaUsuarioService,
    private readonly cfg: ConfigService,
    private readonly logros: UsuarioLogroService,
  ) {}

  @Get('resumen')
  async resumen(@CurrentUser('id') codUsuario: number) {
    const user = await this.usuarios.findById(codUsuario);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 🔎 Resolver nombre del cargo
    const cargoNombre = await this.usuarios.getCargoNombreById(
      // ajusta a tu nombre real de propiedad:
      // si tu user viene como user.cod_cargo_usuario:
      (user.codCargoUsuario ?? user.codCargoUsuario ?? null)
    );

    // stats crudas
    const s = await this.stats.listarMisStats(codUsuario);

    // cálculo nivel y progreso
    const XP = Number(this.cfg.get<string>('XP_POR_NIVEL'));
    const nivelActual = Math.floor(s.xp / XP) + 1;
    const xpEnNivel = s.xp % XP;
    const faltante = XP - xpEnNivel;
    const progreso = xpEnNivel / XP;

    const ultimos = await this.logros.ultimosDelUsuario(codUsuario, 2);

    return {
      usuario: {
        nombre: user.nombreUsuario,
        apellido: user.apellidoUsuario,
        nickname: user.nicknameUsuario,
        cedula: user.cedulaUsuario,
        email:user.correoUsuario,
        cargo: cargoNombre, 
      },
      stats: {
        racha: s.racha,
        monedas: s.monedas,
        xp: s.xp,
        nivel: nivelActual,
        xpEnNivel,
        faltante,
        xpPorNivel: XP,
        progreso,
      },
      logros: ultimos,
    };
  }

  @Patch('nickname')
  async updateNickname(@CurrentUser('id') codUsuario: number, @Body() dto: UpdateNicknameDto) {
    return this.usuarios.updateNickname(codUsuario, dto.nickname);
  }

  @Patch('password')
  async changePassword(@CurrentUser('id') codUsuario: number, @Body() dto: ChangePasswordDto) {
    return this.usuarios.changePassword(codUsuario, dto.currentPassword, dto.newPassword);
  }
}
