# Campus ASFI Inteligente — MVP

Simulador interactivo de aprendizaje basado en escenarios: el usuario analiza una situación
de supervisión, toma decisiones, recibe consecuencias y retroalimentación, y visualiza su
desempeño final. Lógica determinística, sin IA (ver `docs/MVP.md` y `docs/SPEC.md`).

## Stack

- **Backend:** NestJS + TypeORM + PostgreSQL (puerto 3100)
- **Frontend:** Vue 3 + Vite + Pinia + Vue Router (puerto 5173)
- **Persistencia:** PostgreSQL 16 en Docker (puerto **5433** del host)

> Nota de puertos: el 5432 suele estar ocupado por instalaciones locales de Postgres y el
> 3000 por otros servicios, por eso este proyecto usa 5433 y 3100.

## Ejecución

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend (http://localhost:3100/api)
cd backend
npm install
npm run start:dev        # seed idempotente al arranque

# 3. Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Adminer (inspección de la base): http://localhost:8080 — servidor `postgres`, usuario
`campus`, contraseña `campus`, base `campus_asfi`.

## Despliegue (Vercel + Supabase)

La app está preparada para producción: frontend estático + backend como función
serverless bajo el mismo dominio (`vercel.json` + `api/[...path].ts`), con la base
en PostgreSQL de Supabase vía `DATABASE_URL`. Guía paso a paso en
[`docs/DEPLOY.md`](docs/DEPLOY.md).

## Tests

```bash
cd backend  && npm run test:all   # unitarios + e2e (T1–T6 del SPEC; requiere Postgres activo)
cd frontend && npm run test       # store de Pinia
```

## Estructura

```
docs/        MVP, SPEC, PLAN, TASKS, constitución
backend/src/
  simulations/ scenarios/ decisions/ attempts/   # catálogo, contenido e intentos
  evaluation/evaluation.service.ts               # motor de evaluación aislado (sustituible por IA después)
  seed/                                         # simulación piloto completa (content.ts)
frontend/src/
  views/        SimulationsList, SimulationDetail, AttemptView (juego), ResultView
  stores/       attempt.ts (estado del intento)
  api.ts        cliente HTTP + sesión anónima
```

## La simulación piloto

"Análisis de supervisión: crecimiento de cartera y aumento de mora" — 7 escenarios
(E1, E2A/E2B/E2C según la primera decisión, E3, E4, E5) con 3 alternativas cada uno.
El camino depende de las decisiones; el puntaje se revela solo al final. Reintentos ilimitados.
