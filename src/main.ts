import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new HttpExceptionFilter()); 

  const puerto = Number(process.env.PUERTO_SERVIDOR)
  await app.listen(puerto, () => {
    console.log("Servidor funcionando en el puerto: " + puerto)
  });
  
}
bootstrap();
