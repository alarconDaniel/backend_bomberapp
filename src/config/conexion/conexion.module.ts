import 'dotenv/config'; 

import { Archivo } from './../../models/archivo/archivo';
import { Module } from '@nestjs/common';
import { AuditoriaTrofeo } from 'src/models/auditoria-trofeo/auditoria-trofeo';
import { CargoUsuario } from 'src/models/cargo_usuario/cargo-usuario';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';
import { GoogleToken } from 'src/models/google-token/google-token';
import { ItemTienda } from 'src/models/item-tienda/item-tienda';
import { ItemInventario } from 'src/models/item_inventario/item_inventario';
import { Logro } from 'src/models/logro/logro';
import { Reto } from 'src/models/reto/reto';
import { Rol } from 'src/models/rol/rol';
import { TokenReinicioContrasena } from 'src/models/token-reinicio-contraseña/token-reinicio-contraseña';
import { Trofeo } from 'src/models/trofeo/trofeo';
import { UsuarioLogro } from 'src/models/usuario-logro/usuario-logro';
import { UsuarioReto } from 'src/models/usuario-reto/usuario-reto';
import { Usuario } from 'src/models/usuario/usuario';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: String(process.env.HOST),
      port: Number(process.env.PUERTO),
      database: String(process.env.BASE_DATOS),
      username: String(process.env.USUARIO),
      password: String(process.env.CLAVE),
      synchronize: false,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
      entities: [
        Reto, ItemTienda, Usuario, Rol, TokenReinicioContrasena,
        UsuarioReto, CargoUsuario, EstadisticaUsuario, ItemInventario,
        Logro, UsuarioLogro, Trofeo, AuditoriaTrofeo, Archivo, GoogleToken,
      ],
    }),
  ],
  exports: [TypeOrmModule],
  providers: [],
})
export class ConexionModule {}
