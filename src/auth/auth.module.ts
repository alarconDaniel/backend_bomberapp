// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { UsuarioModule } from 'src/modules/public/usuario/usuario.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Módulo de autenticación
// - Expone AuthService
// - Configura JWT de forma asíncrona usando ConfigService
// - Registra la estrategia JWT y el controlador de auth
@Module({
  imports: [
    // Permite inyectar variables de entorno vía ConfigService
    ConfigModule,

    // Integración con Passport para estrategias de auth
    PassportModule,

    // Módulo de conexión a la BD (repositorios / DataSource)
    ConexionModule,

    // Módulo de usuarios (para buscar y actualizar info de usuario)
    UsuarioModule,

    // Configuración del módulo JWT usando la config de la app
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        // Clave para firmar los tokens (en prod debería venir siempre de env)
        secret: cfg.get<string>('JWT_SECRET') || 'dev_fallback_secret', // <-- clave por defecto en dev
        // Opciones adicionales del token, como el issuer
        signOptions: { issuer: 'bomberapp' },
      }),
    }),
  ],
  // Proveedores que viven dentro del contexto de este módulo
  providers: [AuthService, JwtStrategy],
  // Controladores que exponen endpoints relacionados con auth
  controllers: [AuthController],
  // Exportamos AuthService para que otros módulos puedan reutilizar lógica de auth
  exports: [AuthService],
})
export class AuthModule {}
