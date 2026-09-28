# AGENTS.md — Campus ASFI

## Proyecto

Plataforma institucional de formación de la Autoridad de Supervisión del Sistema Financiero (ASFI) de Bolivia. Un docente crea cursos a partir de fuentes oficiales preparadas institucionalmente, la IA genera una propuesta de curso dentro de una plantilla pedagógica institucional fija, y el docente la revisa, edita y publica. Arquitectura: backend NestJS + TypeScript (única autoridad: reglas, permisos, integraciones de IA y persistencia en PostgreSQL), frontend TypeScript separado que solo habla con la API, y una capa de abstracción `AIProvider` que desacopla el dominio de Gemini/NotebookLM.

## Comandos

```
Ejecutar backend (dev):    cd backend && npm run start:dev        # puerto 3100, prefijo /api
Ejecutar frontend (dev):   cd frontend && npm run dev             # puerto 5173, proxy /api
Tests backend:             cd backend && npm run test:all         # unitarios + e2e (requiere Postgres)
Tests frontend:            cd frontend && npm run test
Lint/formato:              cd backend && npm run lint / cd frontend && npm run lint
Base de datos local:       docker compose up -d                   # PostgreSQL en 5433 (5432 ocupado en este equipo)
Despliegue:                Vercel (producción) — ver docs/DEPLOY.md
```

Los comandos de ejecución, tests y lint se materializan en la fase Foundation; hasta entonces este archivo registra los comandos objetivo acordados.

## Estilo y convenciones

- TypeScript estricto en backend y frontend.
- Identificadores en inglés (clases, funciones, tablas, columnas); UI, mensajes de negocio, comentarios y documentación en español.
- Backend: un módulo NestJS por dominio, con entity / service / controller / dto separados; validación de entrada con DTOs + class-validator; lógica de negocio solo en services.
- Frontend: componentes TypeScript, estado por stores de dominio, todas las llamadas HTTP centralizadas en un único cliente API.
- Nombres: PascalCase para clases y componentes, camelCase para variables y funciones, kebab-case para archivos, snake_case solo en base de datos.
- Sin emojis en código, interfaces, mensajes del sistema ni documentación.
- Tests junto al código que prueban (`*.spec.ts`); e2e en `backend/test/`.

## Reglas

- Lee `docs/constitution.md` y la spec activa en `docs/specs/` antes de tocar código.
- No implementes funcionalidad que no esté respaldada por una spec aprobada; los cambios de requisito se reflejan primero en la spec.
- El frontend nunca llama a APIs de Google ni de proveedores de IA; el backend es la única vía.
- No expongas ni commitees secretos (API keys, service accounts, tokens): solo variables de entorno.
- No agregues dependencias nuevas ni modifiques el esquema de base de datos sin preguntar antes.
- No modifiques la plantilla institucional por defecto (ASFI_STANDARD) sin aprobación explícita.
- La IA propone, el docente decide: la IA solo genera contenido dentro de la plantilla; nunca se publica una generación sin revisión (flujo GENERATED, DRAFT, REVIEW, PUBLISHED, ARCHIVED).

## Al terminar cualquier tarea

- Ejecuta los tests del módulo afectado (y la suite completa si tocaste código compartido): la tarea no está terminada hasta que pasen.
- Verifica que el lint no reporte errores.
- Marca la tarea como completada en `tasks/todo.md` y, si cambiaste un requisito, actualiza primero la spec correspondiente.
