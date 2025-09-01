import { Archivo } from './../../models/archivo/archivo';
import { Module } from '@nestjs/common';
import { AuditoriaTrofeo } from 'src/models/auditoria-trofeo/auditoria-trofeo';
import { CargoUsuario } from 'src/models/cargo_usuario/cargo-usuario';
import { EstadisticaUsuario } from 'src/models/estadistica-usuario/estadistica-usuario';
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
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({

    imports: [],
    exports: [DataSource],
    providers: [
        {
            provide: DataSource,
            inject: [],
            useFactory: async () => {
                try {
                    const poolConexion = new DataSource({
                        type: 'mysql',
                        host: String(process.env.HOST),
                        port: Number(process.env.PUERTO),
                        database: String(process.env.BASE_DATOS),
                        username: String(process.env.USUARIO),
                        password: String(process.env.CLAVE),
                        synchronize: false,  // Sincroniza la base de datos con los modelos
                        logging: true,   // Muestra los logs de la base de datos
                        namingStrategy: new SnakeNamingStrategy(),
                        entities: [Reto, ItemTienda, Usuario, Rol, TokenReinicioContrasena, 
                            UsuarioReto, CargoUsuario, EstadisticaUsuario, ItemInventario, 
                            Logro, UsuarioLogro, Trofeo, AuditoriaTrofeo,Archivo], // Aqui van todas las entidades o clases
                        driver: require('mysql2')
                    })

                    await poolConexion.initialize();

                    console.log("Conexión establecida con: " + 
                        String(process.env.BASE_DATOS)
                    );

                    console.log("Daticos de conexión: " + "\n" +
                        "Host: " + String(process.env.HOST) + "\n" +
                        "Port: " + Number(process.env.PUERTO) + "\n" +
                        "User: " + String(process.env.USUARIO) + "\n" +
                        "Password: " + String(process.env.CLAVE)
                    )

                    return poolConexion;

                } catch (elError) {
                    console.log("Error en la conexión");

                    console.log("Daticos de conexión erronea: " + "\n" +
                    "Host: " + String(process.env.HOST) + "\n" +
                    "Port: " + Number(process.env.PUERTO) + "\n" +
                    "User: " + String(process.env.USUARIO) + "\n" +
                    "Password: " + String(process.env.CLAVE)
                )
                    throw elError;
                }

            }

        }

    ],
})
export class ConexionModule { }

