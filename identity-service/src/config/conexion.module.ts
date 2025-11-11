import "dotenv/config";

import { TypeOrmModule } from "@nestjs/typeorm";
import { Global, Module } from "@nestjs/common";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Usuario } from "src/models/usuario/usuario";
import { Rol } from "src/models/rol/rol";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.HOST,
      port: Number(process.env.BD_PORT),
      database: process.env.BASE_DATOS,
      username: process.env.USUARIO,
      password: process.env.CLAVE,
      synchronize: false,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
      entities: [Usuario, Rol],
      retryAttempts: 30,
      retryDelay: 8000,
    }),
  ],
  exports: [TypeOrmModule],
  providers: [],
})
export class ConexionModule {}
