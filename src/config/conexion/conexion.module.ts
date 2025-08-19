import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Reto } from 'src/models/reto/reto';
import { Usuario } from 'src/models/usuario/usuario';

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
                    entities: [Reto, Usuario], // agrega aquí el resto de tus entidades
                    // extra: { connectTimeout: 10000 }, // opcional
                });

                // pequeño retry por si MySQL tarda en estar arriba
                const maxRetries = 5;
                let attempt = 0;
                while (true) {
                    try {
                        await ds.initialize();
                        console.log(
                            `✅ Conexión OK → ${database} @ ${host}:${port} (user: ${username})`
                        );
                        return ds;
                    } catch (err: any) {
                        attempt++;
                        console.error(
                            `❌ Falló la conexión (intento ${attempt}/${maxRetries}).`,
                            err?.code || err?.message
                        );
                        if (attempt >= maxRetries) {
                            console.error(
                                `Daticos de conexión fallida:
                Host: ${host}
                Port: ${port}
                 User: ${username}
                Password: ${password}`
                            );
                            throw err;
                        }
                        await new Promise((r) => setTimeout(r, 1500));
                    }
                }
            },
        },
    ],
    exports: [DataSource],
})
export class ConexionModule { }
