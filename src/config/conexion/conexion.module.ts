// src/config/conexion/conexion.module.ts

// import { PreguntaReporte } from './../../models/pregunta/PreguntaReporte';
import { ItemEmparejamiento } from './../../models/pregunta/ItemEmparejamiento';
import 'dotenv/config';

import { Archivo } from './../../models/archivo/archivo';
import { Module } from '@nestjs/common';
import { AuditoriaTrofeo } from 'src/models/auditoria-trofeo/auditoria-trofeo';
import { CargoUsuario } from 'src/models/cargo_usuario/cargo-usuario';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';
import { ItemTienda } from 'src/models/item-tienda/item-tienda';
import { ItemInventario } from 'src/models/item_inventario/item_inventario';
import { Logro } from 'src/models/logro/logro';
import { RespuestaFormulario } from 'src/models/respuestas/respuesta-form';
import { RespuestaQuiz } from 'src/models/respuestas/respuesta-quiz';
import { Reto } from 'src/models/reto/reto';
import { Rol } from 'src/models/rol/rol';
import { TokenReinicioContrasena } from 'src/models/token-reinicio-contraseña/token-reinicio-contraseña';
import { Trofeo } from 'src/models/trofeo/trofeo';
import { UsuarioLogro } from 'src/models/usuario-logro/usuario-logro';
import { UsuarioReto } from 'src/models/usuario-reto/usuario-reto';
import { Usuario } from 'src/models/usuario/usuario';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargoReto } from 'src/models/cargo-reto/cargo-reto';
import { Pregunta } from 'src/models/pregunta/pregunta';
import { RespuestaPreguntaUsuario } from 'src/models/respuesta/RespuestaPreguntaUsuario';
import { ParejaCorrecta } from 'src/models/pregunta/ParejaCorrecta';
import { OpcionABCD } from 'src/models/pregunta/OpcionABCD';
import { PreguntaRellenar } from 'src/models/pregunta/PreguntaRellenar';
// import { ReporteCargado } from 'src/models/pregunta/ReporteCargado';
import { RespuestaFormularioUsuario } from 'src/models/respuesta/RespuestaFormularioUsuario';
import { AvatarEquipado } from 'src/models/avatar-equipado/avatar-equipado';

// Módulo de conexión a la base de datos
// Centraliza la configuración de TypeORM y expone el TypeOrmModule para el resto de la app
@Module({
  imports: [
    TypeOrmModule.forRoot({
      // Tipo de base de datos que usará TypeORM
      type: 'mysql',

      // Configuración básica leída desde variables de entorno (.env)
      host: String(process.env.HOST),
      port: Number(process.env.PUERTO),
      database: String(process.env.BASE_DATOS),
      username: String(process.env.USUARIO),
      password: String(process.env.CLAVE),

      // IMPORTANTE:
      // - synchronize: false → no deja que TypeORM cambie el esquema en runtime
      synchronize: false,

      // Habilita logs de las consultas (útil en dev, cuidado en prod)
      logging: true,

      // Estrategia de nombres snake_case para columnas y tablas
      namingStrategy: new SnakeNamingStrategy(),

      // Registro explícito de todas las entidades del dominio
      // (retos, usuarios, inventario, preguntas, stats, avatar, etc.)
      entities: [
        Reto,
        ItemTienda,
        Usuario,
        Rol,
        TokenReinicioContrasena,
        UsuarioReto,
        CargoUsuario,
        EstadisticaUsuario,
        ItemInventario,
        Logro,
        UsuarioLogro,
        Trofeo,
        AuditoriaTrofeo,
        Archivo,
        RespuestaFormulario,
        RespuestaQuiz,
        CargoReto,
        Pregunta,
        RespuestaFormularioUsuario,
        RespuestaPreguntaUsuario,
        ParejaCorrecta,
        OpcionABCD,
        ItemEmparejamiento,
        PreguntaRellenar,
        // PreguntaReporte,
        // ReporteCargado,
        AvatarEquipado,
      ],
    }),
  ],
  // Exportamos TypeOrmModule para que otros módulos lo reutilicen
  exports: [TypeOrmModule],
  providers: [],
})
export class ConexionModule {}
