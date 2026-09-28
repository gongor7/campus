# SPEC — courses

Estado: BORRADOR — pendiente de revisión.
Módulo: courses (docs/capability-map.md). Es el corazón del MVP.

## Objetivo

El ciclo de vida del curso: creación con parámetros del docente, estructura (outline) editable, contenido por lección, estados y edición docente. La IA nunca escribe directamente aquí: sus resultados entran por los endpoints de ai-generation y luego el docente edita (control editorial, PROMPT-MAESTRO secciones 10 y 21).

## Modelo de datos

```
courses
  id, title, description, objective, audience, level (BASIC|INTERMEDIATE|ADVANCED),
  targetHours int, templateId fk, sourceSetId fk null,
  status varchar (DRAFT|REVIEW|PUBLISHED|ARCHIVED), createdBy varchar,
  createdAt, updatedAt

course_modules                     -- la estructura (outline)
  id, courseId fk, title, objective, position int, estimatedMinutes int

lessons
  id, courseId fk, moduleId fk, title, objective text null,
  content text null,               -- se llena en Fase B (generación o edición docente)
  estimatedMinutes int, position int,
  sourceRefs jsonb null            -- ["doc-keycloak.pdf", ...] citas de fuente

course_sections                    -- INTRODUCTION / PRACTICE / EVALUATION / CLOSING
  id, courseId fk, type varchar, title, content text null, position int
```

## API

- `POST /api/courses` — crear con: title, description, objective, audience, level, targetHours, templateId. Estado inicial DRAFT. Audit.
- `GET /api/courses` / `GET /api/courses/:id` — listado (por estado) y detalle completo con módulos, lecciones y secciones.
- `PATCH /api/courses/:id` — editar datos generales (solo en DRAFT o REVIEW).
- `PUT /api/courses/:id/outline` — reemplazar estructura completa (módulos, lecciones con minutos y sourceRefs, secciones). Valida contra template. Solo DRAFT/REVIEW.
- `PATCH /api/lessons/:id` y `PATCH /api/course-sections/:id` — edición puntual de contenido (control editorial). Solo DRAFT/REVIEW.
- `POST /api/courses/:id/archive` — ARCHIVED (ver SPEC-publication para el resto de transiciones).

## Reglas de negocio

- Estados y transiciones: DRAFT → REVIEW → PUBLISHED → ARCHIVED (publicar sin pasar por revisión está prohibido; detalle en SPEC-publication).
- En PUBLISHED el curso es de solo lectura en el MVP; volver a editable queda para versiones futuras.
- La estructura debe cumplir las restricciones de la plantilla (min/max módulos y lecciones).
- Toda mutación escribe en audit.

## Testing Strategy

- E2e: crear curso → listar → ver detalle; reemplazar outline (válido aceptado, inválido 400); editar lección; transición fallida fuera de estado → 400.
- Unitario: validador de outline contra template.

## Success Criteria

1. Un curso creado con outline y lecciones editadas se recupera completo y consistente vía GET.
2. Ninguna mutación fuera de estado permitida tiene efecto (400 con mensaje claro).
3. Cada mutación deja su registro de auditoría.

## Enmienda (2026-09-28, SPEC-student-view)

ARCHIVED deja de significar inaccesible para estudiantes inscritos: el curso se retira del
catalogo publico pero los inscritos pueden terminarlo y revisarlo desde "Mis cursos"
(SPEC-student-view RF-29). El curso sigue siendo de solo lectura para el docente.
Publicar exige, ademas, cuaderno con al menos una fuente y banco de preguntas aprobado
(definidos en SPEC-student-view RF-18; el modulo publication los hara cumplir).
