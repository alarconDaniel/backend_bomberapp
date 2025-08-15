// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Opcional (web). En React Native no aplica, pero no estorba:
  app.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' });

  const puerto = Number(process.env.PUERTO_SERVIDOR) || 3550;
  await app.listen(puerto, '0.0.0.0');

  console.log(`🚀 API en http://localhost:${puerto}`);
}
bootstrap();
