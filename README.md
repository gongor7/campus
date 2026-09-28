# Campus ASFI — MVP de creación de cursos

Plataforma institucional de la Autoridad de Supervisión del Sistema Financiero (ASFI):
un docente vincula un cuaderno de fuentes oficiales, la IA propone la estructura del
curso dentro de la plantilla institucional ASFI_STANDARD, y el docente revisa, edita
y publica. Documentación completa en `docs/` (contexto, mapa de capacidades y specs).

## Flujo del MVP

```
Cuaderno de fuentes (PDF/PPTX/DOCX/TXT)
        |
        v
Crear curso (nombre, objetivo, publico, nivel, duracion)
        |
        v
Fase A: IA propone estructura (modulos, lecciones, minutos, citas, brechas)
        |
        v
Docente ajusta la estructura
        |
        v
Fase B: contenido leccion por leccion (regenerable individualmente)
        |
        v
Revision docente -> Publicar (DRAFT -> REVIEW -> PUBLISHED)
```

La IA trabaja con contexto cerrado: solo las fuentes del cuaderno vinculado,
sin busqueda externa, con citas por leccion y brechas de cobertura explicitas.
Toda operacion queda en auditoria y cada generacion es trazada (proveedor,
modelo, duracion, resultado).

## Stack

- Backend: NestJS + TypeScript + TypeORM + PostgreSQL (puerto 3100, prefijo /api)
- Frontend: Vue 3 + Vite + TypeScript + Pinia (puerto 5173, proxy /api)
- IA: abstraccion AIProvider — `mock` (desarrollo/tests, sin red) y `gemini`
  (requiere `GEMINI_API_KEY`); seleccion con `AI_PROVIDER`
- Base de datos: PostgreSQL 16 en Docker (puerto 5433) / Supabase en produccion
- Identidad visual: paleta y logo oficiales de asfi.gob.bo (docs/specs/SPEC-ui.md)

## Ejecucion local

```bash
docker compose up -d          # PostgreSQL (5433) + adminer (8080)

cd backend
npm install
npm run start:dev             # http://localhost:3100/api/health

cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Variables del backend (`backend/.env`): `DB_*` para la base local, o
`DATABASE_URL` para una externa (Supabase); `AI_PROVIDER` (mock|gemini),
`GEMINI_API_KEY`, `GEMINI_MODEL`.

## Tests

```bash
cd backend  && npm run test:all    # 7 unitarios + 14 e2e (requiere Postgres activo)
cd frontend && npm run test        # helpers del design system
```

## Despliegue (Vercel + Supabase)

Misma configuracion validada de la fase anterior: funcion serverless
`api/index.ts` + reescritura de `/api/*`, build via `vercel.json`. En Vercel,
variables de entorno: `DATABASE_URL` (Supabase session pooler, puerto 5432) y,
cuando se habilite la IA real, `GEMINI_API_KEY` (sin ella el proveedor cae a
`mock` de forma segura).

## Estructura

```
AGENTS.md                     convenciones y reglas del proyecto
api/index.ts                  funcion serverless de Vercel
backend/src/
  health/ audit/ templates/ sources/ courses/ generation/ publication/
  generation/mock.provider.ts     IA deterministica para desarrollo/tests
  generation/gemini.provider.ts   IA real (API de Gemini, contexto cerrado)
frontend/src/
  views/                      CoursesList, CourseCreate (asistente 3 pasos),
                               CourseEditor, SourceSets, AuditView
docs/
  context/PROMPT-MAESTRO.md   documento fundacional
  capability-map.md           modulos, decisiones D1-D7
  specs/                      una spec por modulo
design/mockup.html            propuesta visual aprobada (paleta institucional)
```
