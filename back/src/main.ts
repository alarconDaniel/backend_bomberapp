// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
  console.log(`🩺 Health: http://localhost:${puerto}/api/health`);

}
bootstrap();
