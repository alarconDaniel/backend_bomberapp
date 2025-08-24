// src/config/conexion/conexion.module.ts
import { Module, Global } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Reto } from 'src/models/reto/reto';
import { Usuario } from 'src/models/usuario/usuario';
import { Archivo } from 'src/models/archivo/archivo';

@Global() // 👈
@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        const host = process.env.HOST || '127.0.0.1';
        const port = Number(process.env.PUERTO) || 3306;
        const database = process.env.BASE_DATOS || 'bd_bomberapp';
        const username = process.env.USUARIO || 'root';
        const password = process.env.CLAVE ?? '123456';

        const ds = new DataSource({
          type: 'mysql',
          host,
          port,
          database,
          username,
          password,
          synchronize: false,
          logging: true,
          namingStrategy: new SnakeNamingStrategy(),
          entities: [Reto, Usuario, Archivo],
        });

        const maxRetries = 5;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            await ds.initialize();
            console.log(`✅ Conexión OK → ${database} @ ${host}:${port} (user: ${username})`);
            return ds;
          } catch (err: any) {
            console.error(`❌ Falló la conexión (intento ${attempt}/${maxRetries}).`, err?.code || err?.message);
            if (attempt === maxRetries) throw err;
            await new Promise((r) => setTimeout(r, 1500));
          }
        }
        throw new Error('No se pudo inicializar DataSource');
      },
    },
  ],
  exports: [DataSource],
})
export class ConexionModule {}
