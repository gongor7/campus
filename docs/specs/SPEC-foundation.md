# SPEC — foundation

Estado: BORRADOR — pendiente de revisión humana.
Módulo: foundation (docs/capability-map.md, aprobado).

## Objetivo

Crear la base técnica del nuevo Campus ASFI desde cero: dos aplicaciones (backend NestJS y frontend Vue 3, ambos TypeScript estricto), tooling de calidad (lint, formato, tests), PostgreSQL local vía Docker, módulo health verificable, y despliegue a Vercel/Supabase funcionando. Es la plateforma sobre la que se construyen audit, templates, courses y demás módulos del mapa.

## Tech Stack

- Backend: NestJS 10 + TypeScript 5 (estricto), TypeORM + pg 8.12 (anclada: compatibilidad con el runtime), class-validator.
- Frontend: Vue 3 + Vite + TypeScript, Pinia, Vue Router, fetch nativo (sin axios).
- Base de datos: PostgreSQL 16 — Docker local (puerto 5433, el 5432 está ocupado en el equipo) y Supabase en producción.
- Tests: Jest + Supertest (backend), Vitest (frontend).
- Calidad: ESLint + Prettier en ambos proyectos.

## Commands

```
cd backend  && npm run start:dev     # backend en :3100, prefijo /api
cd frontend && npm run dev           # frontend en :5173, proxy /api
cd backend  && npm run test:all      # unitarios + e2e
cd frontend && npm run test
cd backend && frontend && npm run lint
docker compose up -d                 # Postgres local :5433
```

## Estructura del proyecto

```
backend/
  src/
    main.ts               # arranque local (createApp + listen)
    create-app.ts         # factoría compartida con serverless
    app.module.ts         # TypeORM (DATABASE_URL o DB_*), módulos
    health/               # GET /api/health — primer endpoint verificable
    common/                     # errores, decoradores utilitarios
  test/                   # e2e (Supertest)
frontend/
  src/
    api.ts                # único cliente HTTP
    router.ts  stores/  views/
  tests/
docs/
  context/    capability-map.md    specs/    archive/
tasks/                   # plan.md y todo.md del flujo SDD
docker-compose.yml       # postgres + adminer
```

## Code Style

```typescript
// Identificadores en inglés; comentarios y mensajes en español; sin emojis.
@Injectable()
export class HealthService {
  getStatus(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

- PascalCase clases/componentes, camelCase funciones/variables, kebab-case archivos, snake_case solo en base de datos.
- Un módulo NestJS por dominio: entity / service / controller / dto.
- DTOs con class-validator; lógica de negocio solo en services.

## Testing Strategy

- Backend: unitarios por servicio (`*.spec.ts`) y e2e en `test/` contra Postgres local. La suite debe estar verde antes de cerrar cualquier tarea (constitución).
- Frontend: Vitest para stores y componentes con lógica.
- En foundation, el criterio mínimo: e2e de `/api/health` (200 + JSON) y smoke del build de frontend.

## Boundaries

- Always: TypeScript estricto; tests verdes; lint limpio; español en UI y mensajes.
- Ask first: dependencias nuevas (más allá de las listadas), cambios de esquema de base de datos, cambios en el deploy.
- Never: secretos en el repo; llamadas a APIs de IA desde el frontend; publicar sin spec aprobada.

## Success Criteria

1. `docker compose up -d` + `npm run start:dev` + `npm run dev` levantan la app completa en local.
2. `GET /api/health` responde 200 con `{ status: 'ok' }` (local y en producción).
3. `npm run test:all` y `npm run test` verdes desde el primer commit de foundation.
4. Lint sin errores en ambos proyectos.
5. Deploy verificado en Vercel con Supabase (nuevo proyecto `campus-asfi` o reutilización del existente — ver Open Questions).
6. README con instrucciones de arranque y datos del contexto.

## Open Questions

1. ¿Reutilizamos el proyecto Vercel `campus` (ya configurado y desplegando) o creamos uno nuevo `campus-asfi` limpio? Recomendación: reutilizar y redirigir cuando el nuevo MVP esté listo, para no perder el dominio ya probado.
2. La API key de Gemini NO se configura en foundation (llega en ai-generation); aquí solo se reserva la convención `GEMINI_API_KEY` en variables de entorno.
