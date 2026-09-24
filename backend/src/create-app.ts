import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Crea la aplicación Nest sin escuchar puerto.
 * La usan tanto el servidor local (main.ts) como la función
 * serverless de Vercel (api/[...path].ts).
 */
export async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  await app.init();
  return app;
}
