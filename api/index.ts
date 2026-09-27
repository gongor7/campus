import 'reflect-metadata';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../backend/dist/create-app';

// Función serverless de Vercel: vercel.json reescribe /api/* hacia esta función,
// que delega en la misma aplicación NestJS que corre en local. La app se cachea
// entre invocaciones para no reconstruir el módulo en cada request.
let cached: Awaited<ReturnType<typeof createApp>> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cached ??= await createApp();
  // Vercel puede entregar la URL reescrita (/api); el path original viaja en
  // x-vercel-original-path cuando hay reescritura — lo restauramos para que
  // Express enrute correctamente.
  const original = req.headers['x-vercel-original-path'];
  if (original && req.url && !req.url.startsWith(original)) {
    req.url = original as string;
  }
  cached.getHttpAdapter().getInstance()(req, res);
}
