// perfil.controller.ts
import { Body, Controller, Get, NotFoundException, Patch } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UsuarioService } from '../usuario/usuario.service';
import { EstadisticaUsuarioService } from '../estadistica-usuario/estadistica-usuario.service';
import { ConfigService } from '@nestjs/config';
import { UsuarioLogroService } from '../usuario-logro/usuario-logro.service';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

/**
 * Endpoints del perfil del usuario autenticado:
 * resumen, actualización de datos básicos, nickname y contraseña.
 */
@ApiTags('Perfil')
@ApiBearerAuth('access-token') 
@Controller('mi-perfil')
export class PerfilController {
  constructor(
    private readonly usuarios: UsuarioService,
    private readonly stats: EstadisticaUsuarioService,
    private readonly cfg: ConfigService,
    private readonly logros: UsuarioLogroService,
  ) {}

  /**
   * Devuelve resumen de perfil + stats + últimos logros del usuario actual.
   */
  @Get('resumen')
  @ApiOperation({ summary: 'Obtener resumen de perfil y estadísticas del usuario actual' })
  async resumen(@CurrentUser('id') codUsuario: number) {
    const user = await this.usuarios.findById(codUsuario);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 🔎 Resolver nombre del cargo a partir del FK del usuario
    const cargoNombre = await this.usuarios.getCargoNombreById(
      // ajusta a tu nombre real de propiedad:
      // si tu user viene como user.cod_cargo_usuario:
      (user.codCargoUsuario ?? user.codCargoUsuario ?? null)
    );

    // stats crudas del usuario
    const s = await this.stats.listarMisStats(codUsuario);

    // cálculo de nivel y progreso en el nivel actual
    const XP = Number(this.cfg.get<string>('XP_POR_NIVEL'));
    const nivelActual = Math.floor(s.xp / XP) + 1;
    const xpEnNivel = s.xp % XP;
    const faltante = XP - xpEnNivel;
    const progreso = xpEnNivel / XP;

    // últimos logros obtenidos (por ejemplo, para el panel de perfil)
    const ultimos = await this.logros.ultimosDelUsuario(codUsuario, 2);

    return {
      usuario: {
        nombre: user.nombreUsuario,
        apellido: user.apellidoUsuario,
        nickname: user.nicknameUsuario,
        cedula: user.cedulaUsuario,
        email: user.correoUsuario,
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

  /**
   * Actualiza datos básicos del perfil (nombre, apellido, email, cédula, nickname).
   */
  @Patch('datos')
  @ApiOperation({ summary: 'Actualizar datos básicos de mi perfil' })
  @ApiBody({ type: UpdateMyProfileDto })
  async updateMyData(
    @CurrentUser('id') codUsuario: number,
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.usuarios.updateSelf(codUsuario, dto);
  }

  /**
   * Actualiza solo el nickname visible del usuario.
   */
  @Patch('nickname')
  @ApiOperation({ summary: 'Actualizar mi nickname público' })
  @ApiBody({ type: UpdateNicknameDto })
  async updateNickname(
    @CurrentUser('id') codUsuario: number,
    @Body() dto: UpdateNicknameDto,
  ) {
    return this.usuarios.updateNickname(codUsuario, dto.nickname);
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   */
  @Patch('password')
  @ApiOperation({ summary: 'Cambiar mi contraseña' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @CurrentUser('id') codUsuario: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usuarios.changePassword(
      codUsuario,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
