import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const puerto = Number(process.env.PUERTO_SERVIDOR)
  await app.listen(puerto, () => {
    console.log("Servidor funcionando en el puerto: " + puerto)
  });
  
}
bootstrap();
