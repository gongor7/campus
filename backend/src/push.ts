import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Aplica el esquema (synchronize) y ejecuta el seed una única vez contra la
 * base indicada por DATABASE_URL (o el .env local) y termina. Pensado para
 * preparar la base de Supabase antes del despliegue en Vercel:
 *
 *   DATABASE_URL="postgres://..." npm run db:push
 */
async function main() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  await app.close();
  process.exit(0);
}
void main();
