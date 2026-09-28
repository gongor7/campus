# Mapa de capacidades — Campus ASFI (MVP creación de cursos)

Estado: APROBADO (2026-09-27).
Fuente: docs/context/PROMPT-MAESTRO.md (secciones 22-23).

## Decisiones registradas

| # | Decisión |
|---|---|
| D1 | Arranque limpio en este repo; el simulador queda en el historial de git (docs/archive conserva sus documentos) y su deploy sigue vivo. |
| D2 | Gemini: el equipo genera una API key de Gemini. El notebook se vincula por ID (trazabilidad) y las fuentes se adjuntan al curso para la generación. NotebookLMProvider es implementación futura. |
| D3 | Auth diferida: la primera iteración opera con un usuario docente fijo en backend; el módulo auth (email+contraseña, roles ADMIN/TEACHER) entra en una segunda pasada, antes de cualquier despliegue multiusuario. |
| D4 | Frontend Vue 3 + TypeScript (justificado por continuidad del equipo y tipos compartidos con NestJS). |
| D5 | Infraestructura reutilizada: PostgreSQL en Supabase y deploy en Vercel (ya validadas en la fase anterior del repo). |

## Módulos

| Módulo | Responsabilidad | Depende de |
|---|---|---|
| foundation | Repo, estructura backend/frontend, tooling (lint, tests), Docker, esquema base, deploy | — |
| audit | Registro de operaciones (quién, qué, recurso, cuándo, resultado) | foundation |
| templates | Plantilla institucional (ASFI_STANDARD) y sus secciones | foundation |
| courses | Curso, estados (DRAFT/REVIEW/PUBLISHED/ARCHIVED), edición docente, fuentes adjuntas | templates, audit |
| notebooks | Vinculación curso-notebook (notebookId) y modelo de fuentes | courses |
| ai-generation | Abstracción AIProvider, GeminiProvider, generación de propuesta, regeneración parcial, validación de esquema | courses, notebooks, audit |
| publication | Flujo de revisión, aprobación y publicación (transiciones de estado) | courses, audit |
| ui | Design system institucional y vistas del flujo completo | todos (consume API) |
| auth | Usuarios, roles (ADMIN/TEACHER), sesiones | foundation (se construye diferido, ver D3) |

## Orden de construcción

```
foundation → audit → templates → courses → notebooks → ai-generation → publication
ui: incremental, junto a cada módulo que aporte una pantalla
auth: diferido (D3) — antes de cualquier uso multiusuario real
```

Notas:
- audit se construye temprano como servicio transversal: todos los módulos lo usan desde el primer día.
- El estudiante queda fuera del MVP (PROMPT-MAESTRO sección 24); el curso publicado es el artefacto final.
- Cada módulo tiene su spec en docs/specs/ (SPEC-foundation.md, SPEC-courses.md, ...).
