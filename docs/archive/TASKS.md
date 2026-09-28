# Tareas — Campus ASFI Inteligente (MVP)

Cada tarea ≤ 30 min y corresponde a una fase del `docs/PLAN.md`. Regla de cierre: tests pasando o validación definida ejecutada (Constitución #5, #13).

## Fase 1 — Estructura
- [x] T-1.1 docker-compose.yml (postgres + adminer) y `.env` del backend.
- [x] T-1.2 Scaffold NestJS backend con TypeORM configurado.
- [x] T-1.3 Scaffold Vue 3 + Vite + Pinia + Router con proxy `/api`.
- [x] T-1.4 README con instrucciones de ejecución.

## Fase 2 — Contenido
- [x] T-2.1 Entidades: simulations, scenarios, decisions, attempts, attempt_steps.
- [x] T-2.2 Redacción del contenido piloto (escenarios, ramas, feedback, puntajes) en archivo seed.
- [x] T-2.3 Seed idempotente + test T7.

## Fase 3 — Motor y API
- [x] T-3.1 Módulo simulations (GET list/detail).
- [x] T-3.2 Módulo attempts: POST /attempts (T1).
- [x] T-3.3 Evaluation service + POST /attempts/:id/decisions (T2, T4, T6).
- [x] T-3.4 Cierre de intento y GET result (T3, T5).
- [x] T-3.5 Suite e2e completa verde.

## Fase 4 — Frontend catálogo
- [x] T-4.1 Cliente API + sessionId anónimo.
- [x] T-4.2 Vista catálogo `/` y detalle `/simulations/:id`.

## Fase 5 — Frontend juego
- [x] T-5.1 Store del intento (Pinia) + tests mínimos.
- [x] T-5.2 Vista `/attempts/:id`: escenario + tablero + alternativas.
- [x] T-5.3 Panel consecuencia/feedback + progreso + continuar/fin.

## Fase 6 — Frontend resultado
- [x] T-6.1 Vista resultado con puntaje, camino y feedback.
- [x] T-6.2 Reintentos (nuevo intento desde resultado).

## Fase 7 — Validación
- [x] T-7.1 Suite completa backend + frontend.
- [x] T-7.2 E2E manual de dos caminos distintos documentado.
- [x] T-7.3 README final.

## Fase 8 — Despliegue (Vercel + Supabase)
- [x] T-8.1 Función serverless `api/[...path].ts` + `vercel.json` (build, output, rewrites).
- [x] T-8.2 Soporte `DATABASE_URL` con SSL (Supabase) manteniendo `DB_*` local.
- [x] T-8.3 Refactor `createApp()` compartido por servidor local y serverless (verificado con smoke test + delegación Express).
- [x] T-8.4 Script `db:push` para aplicar esquema/seed contra la base remota (verificado).
- [x] T-8.5 Guía `docs/DEPLOY.md` + README.
