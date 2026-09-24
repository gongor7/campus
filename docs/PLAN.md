# Plan — Campus ASFI Inteligente (MVP)

Deriva de `docs/SPEC.md` (aprobado). Cada fase produce evidencia verificable (tests o validación manual definida).

## Fases

1. **Estructura y ejecución** — repo, docker-compose (Postgres + adminer), README. Verificación: `docker compose up -d` deja Postgres accesible.
2. **Backend: contenido** — entidades TypeORM, seed idempotente con la simulación piloto completa (~7 escenarios ramificados). Verificación: T7 (integridad del árbol + idempotencia).
3. **Backend: motor y API** — módulo attempts, servicio de evaluación aislado, endpoints REST. Verificación: T1–T6.
4. **Frontend: catálogo** — vistas `/` y `/simulations/:id` con consumo de API. Verificación: navegación manual contra backend real.
5. **Frontend: juego** — `/attempts/:id`: escenario, tablero, decisión, feedback, progreso. Verificación: recorrido completo de un camino.
6. **Frontend: resultado** — `/attempts/:id/result` con puntaje, camino, reintento. Verificación: dos caminos distintos completados.
7. **Validación final** — suite completa, e2e de dos caminos, README final.

## Stack y comandos

- Backend: NestJS 10 + TypeORM + postgres + class-validator; Jest + Supertest.
- Frontend: Vue 3 + Vite + Pinia + Vue Router + fetch nativo (sin axios).
- Postgres: docker compose; backend `npm run start:dev` (:3000, `/api`); frontend `npm run dev` (:5173, proxy `/api`).

## Fase 8 — Despliegue
Frontend estático + backend serverless en Vercel (misma origen vía rewrites de `/api/*`), PostgreSQL en Supabase con `DATABASE_URL`. Verificación: smoke test local de `createApp()` + delegación Express (camino exacto de la función) y `db:push` ejecutado sin errores.
