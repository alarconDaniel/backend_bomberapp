// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

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

  // Prefijo global
  const GLOBAL_PREFIX = 'api';
  app.setGlobalPrefix(GLOBAL_PREFIX);

  // CORS para LAN/Expo/dev
  app.enableCors({
    origin: (_origin, cb) => cb(null, true),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  // Parsers y límites
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Health simple sin controller
  const http = app.getHttpAdapter().getInstance();
  http.get(`/${GLOBAL_PREFIX}/health`, (_req: any, res: any) =>
    res.json({ ok: true, ts: new Date().toISOString() })
  );

  // Dump de rutas registradas (sin getGlobalPrefix)
  if (http._router?.stack) {
    console.log('--- RUTAS REGISTRADAS ---');
    http._router.stack
      .filter((r: any) => r.route)
      .forEach((r: any) => {
        const path = r.route.path;
        const methods = Object.keys(r.route.methods)
          .filter((m) => r.route.methods[m])
          .join(',')
          .toUpperCase();
        console.log(`${methods.padEnd(7)} /${GLOBAL_PREFIX}${path}`);
      });
    console.log('-------------------------');
  }

  const puerto = Number(process.env.PUERTO_SERVIDOR) || 3550;
  await app.listen(puerto, '0.0.0.0');

  console.log(`🚀 API http://localhost:${puerto}`);
  console.log(`🩺 Health: http://localhost:${puerto}/${GLOBAL_PREFIX}/health`);
}
bootstrap();
