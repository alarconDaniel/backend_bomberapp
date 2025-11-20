import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

/**
 * Bootstraps the NestJS application and configures the Swagger/OpenAPI
 * documentation for the Identity Service.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Port is provided via environment variable.
  // If undefined, Nest will fall back to its default port.
  const port = Number(process.env.PORT);

  // --- Swagger/OpenAPI configuration ---
  const config = new DocumentBuilder()
    .setTitle('Identity Service - BomberApp')
    .setDescription('Authentication and user management microservice')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt-auth', // Name of the security scheme used in controllers
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // e.g. http://localhost:8090/docs

  await app.listen(port);
  console.log(`Identity listening on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
}

bootstrap();
