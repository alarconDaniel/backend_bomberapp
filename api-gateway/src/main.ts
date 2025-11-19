// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

const DEFAULT_PORT = 7077;
const SWAGGER_PATH = 'docs';
const SWAGGER_BEARER_AUTH_NAME = 'jwt-auth';

const SWAGGER_BEARER_AUTH_CONFIG = {
  type: 'http' as const,
  scheme: 'bearer' as const,
  bearerFormat: 'JWT' as const,
};

const API_TITLE = 'BomberApp API Gateway';
const API_DESCRIPTION =
  'API Gateway orchestrating identity-service, retos-service, and other backend services.';
const API_VERSION = '1.0.0';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // TODO: Restrict allowed origins for production environments.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setDescription(API_DESCRIPTION)
    .setVersion(API_VERSION)
    .addBearerAuth(SWAGGER_BEARER_AUTH_CONFIG, SWAGGER_BEARER_AUTH_NAME)
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? DEFAULT_PORT;

  await app.listen(port);

  // Logging URLs for local debugging and quick access to documentation.
  console.log(`API Gateway listening on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/${SWAGGER_PATH}`);
}

bootstrap();
