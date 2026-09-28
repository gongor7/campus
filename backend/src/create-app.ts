import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Crea la aplicacion Nest sin escuchar puerto. La usan el servidor local
 * (main.ts) y la funcion serverless de Vercel (api/index.ts).
 */
export async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.enableCors();
  await app.init();
  return app;
}
