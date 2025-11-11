import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

const port = Number(process.env.PORT);

  // --- Config Swagger/OpenAPI ---
  const config = new DocumentBuilder()
    .setTitle('Identity Service - BomberApp')
    .setDescription('Microservicio de autenticación y gestión de usuarios')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt-auth', // nombre del esquema
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document); // http://localhost:8090/docs
 

  await app.listen(port);
  console.log(`Identity escuchando en http://localhost:${port}`);
  console.log(`Swagger en http://localhost:${port}/docs`);
}
bootstrap();
