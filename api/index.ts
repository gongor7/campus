import 'reflect-metadata';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../backend/dist/create-app';

// Funcion serverless de Vercel: vercel.json reescribe /api/* hacia esta funcion,
// que delega en la misma aplicacion NestJS que corre en local. La app se cachea
// entre invocaciones para no reconstruir el modulo en cada request.
let cached: Awaited<ReturnType<typeof createApp>> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cached ??= await createApp();
  // Vercel puede entregar la URL reescrita (/api); el path original viaja en
  // x-vercel-original-path cuando hay reescritura: lo restauramos para que
  // Express enrute correctamente.
  const original = req.headers['x-vercel-original-path'];
  const originalPath = Array.isArray(original) ? original[0] : original;
  if (originalPath && req.url && !req.url.startsWith(originalPath)) {
    req.url = originalPath;
  }
  cached.getHttpAdapter().getInstance()(req, res);
}
