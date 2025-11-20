import "dotenv/config";

import { TypeOrmModule } from "@nestjs/typeorm";
import { Global, Module } from "@nestjs/common";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Usuario } from "src/models/usuario/usuario";
import { Rol } from "src/models/rol/rol";

@Global() // Makes the connection module available across the entire application without re-importing it.
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.HOST,            // Database host (from environment variables).
      port: Number(process.env.BD_PORT), // Database port (parsed from string to number).
      database: process.env.BASE_DATOS,  // Database name.
      username: process.env.USUARIO,     // Database username.
      password: process.env.CLAVE,       // Database password.
      synchronize: false,                // Disabled to avoid schema auto-sync in production.
      logging: true,                     // Enables SQL logging for debugging and monitoring.
      namingStrategy: new SnakeNamingStrategy(), // Ensures snake_case naming for tables and columns.
      entities: [Usuario, Rol],          // Entities managed by this connection.
      retryAttempts: 30,                 // Number of reconnection attempts if the DB is not available.
      retryDelay: 8000,                  // Delay (in ms) between reconnection attempts.
    }),
  ],
  exports: [TypeOrmModule], // Exposes TypeOrmModule so other modules can use the same DB connection.
  providers: [],
})
// Global database connection module for the application.
export class ConexionModule {}
