import 'reflect-metadata';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../backend/dist/create-app';

// Función serverless de Vercel: atiende todas las rutas /api/* delegando
// en la misma aplicación NestJS que corre en local. La app se cachea entre
// invocaciones para evitar reconstruir el módulo en cada request.
let cached: Awaited<ReturnType<typeof createApp>> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cached ??= await createApp();
  cached.getHttpAdapter().getInstance()(req, res);
}
