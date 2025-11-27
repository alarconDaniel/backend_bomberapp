// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Carga las credenciales de GCP desde la variable de entorno base64
 * y las deja disponibles en un archivo runtime para los SDKs.
 */
function ensureGcpCreds() {
  const b64 = process.env.GCP_SA_KEY_B64;
  if (!b64) return;
  const jsonStr = Buffer.from(b64, 'base64').toString('utf8');
  const credPath = './secrets/gcp-key.runtime.json';
  if (!existsSync(dirname(credPath))) mkdirSync(dirname(credPath), { recursive: true });
  writeFileSync(credPath, jsonStr, { encoding: 'utf8' });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
}
ensureGcpCreds();

/**
 * Punto de entrada del servidor NestJS:
 * configura pipes, filtros, Swagger y arranca el HTTP server.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS para LAN/Expo/dev
  // app.enableCors({
  //   origin: (_origin, cb) => cb(null, true),
  //   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  //   credentials: true,
  // });

  const puerto = Number(process.env.PUERTO_SERVIDOR)

  // Swagger / OpenAPI para documentar y explorar la API HTTP
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SERVIDOR BOMBER-APP')
    .setDescription(
      'API NestJS que soporta BomberApp, la plataforma de gamificación para la empresa Grúas y Equipos. ' +
      'Gestiona autenticación segura, perfiles de usuario, retos y logros, trofeos, ranking, tienda e inventario, ' +
      'estadísticas y reportes, así como subida y descarga de evidencias (uploads) para más de 120 operarios remotos. ' +
      'Forma parte del MVP presentado en el Hackathon FIS 2025, con énfasis en trazabilidad de actividades, ' +
      'motivación mediante dinámicas de juego y acceso multiplataforma, alineado con buenas prácticas de seguridad (JWT, Argon2id) ' +
      'y referencias ISO/IEC 25010 e IEEE 830.'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT de acceso (Authorization: Bearer <token>)',
      },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(puerto, () => {
    console.log("Servidor funcionando en el puerto: " + puerto)
  });

  // Parsers y límites
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  // Health simple sin controller
  const http = app.getHttpAdapter().getInstance();
  http.get(`/api/health`, (_req: any, res: any) =>
    res.json({ ok: true, ts: new Date().toISOString() })
  );

  console.log(`🚀 API http://localhost:${puerto}`);
  console.log(`📜 Swagger: http://localhost:${puerto}/docs`);
  console.log(`🩺 Health: http://localhost:${puerto}/api/health`);
}
bootstrap();
