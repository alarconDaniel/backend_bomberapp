import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtVerifierModule } from '@bomberapp/jwt-auth';
import authDatabaseConfig, {
  AUTH_DATABASE,
  AuthDatabaseConfig,
} from '../config/auth-database.config';
import jwtConfig, { AUTH_JWT, JwtConfig } from '../config/jwt.config';
import usersClientConfig from '../config/users-client.config';
import { Usuario } from '../entities/usuario.entity';
import { TokenReinicioContrasena } from '../entities/token-reinicio-contrasena.entity';
import { UsersClientModule } from '../users/users-client.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authDatabaseConfig, jwtConfig, usersClientConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const cfg = config.get<AuthDatabaseConfig>(AUTH_DATABASE);
        if (!cfg) {
          throw new Error('Configuración de base de datos no encontrada');
        }
        return {
          type: 'mysql',
          host: cfg.host,
          port: cfg.port,
          username: cfg.username,
          password: cfg.password,
          database: cfg.database,
          synchronize: cfg.synchronize,
          entities: [Usuario, TokenReinicioContrasena],
        };
      },
    }),
    TypeOrmModule.forFeature([Usuario, TokenReinicioContrasena]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const cfg = config.get<JwtConfig>(AUTH_JWT);
        if (!cfg) {
          throw new Error('Configuración JWT no encontrada');
        }
        return {
          secret: cfg.accessSecret,
          signOptions: {
            expiresIn: cfg.accessTtl,
            issuer: cfg.issuer,
            audience: cfg.audience,
          },
        };
      },
    }),
    JwtVerifierModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const cfg = config.get<JwtConfig>(AUTH_JWT);
        if (!cfg) {
          throw new Error('Configuración JWT no encontrada');
        }
        return {
          secretOrPublicKey: cfg.accessSecret,
          issuer: cfg.issuer,
          audience: cfg.audience,
        };
      },
    }),
    UsersClientModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
