# SPEC — templates

Estado: BORRADOR — pendiente de revisión.
Módulo: templates (docs/capability-map.md).

## Objetivo

Definir la plantilla pedagógica institucional (ASFI_STANDARD): la estructura que todo curso debe respetar. La institución define la estructura; la IA y el docente trabajan dentro de ella (PROMPT-MAESTRO secciones 6 y 21).

## Modelo de datos

```
course_templates
  id        bigint pk
  code      varchar(50) unique   -- 'ASFI_STANDARD'
  name      varchar(100)
  sections  jsonb                -- definición ordenada de secciones (abajo)
  isActive  boolean default true
```

Secciones de ASFI_STANDARD (sembradas por seed, versión inicial):

```
[
  { "type": "INTRODUCTION", "required": true },
  { "type": "MODULES", "required": true, "minModules": 2, "maxModules": 8,
    "minLessonsPerModule": 2, "maxLessonsPerModule": 6 },
  { "type": "PRACTICE", "required": true },
  { "type": "EVALUATION", "required": true },
  { "type": "CLOSING", "required": true }
]
```

## API

- `GET /api/templates` — listar plantillas activas.
- `GET /api/templates/:id` — detalle con secciones y restricciones.
- Sin create/update/delete en el MVP: la plantilla se siembra y no se edita por interfaz (regla de AGENTS.md).

## Reglas

- Todo curso se crea contra una plantilla activa; por defecto ASFI_STANDARD.
- La validación de estructura (cantidad de módulos/lecciones, secciones requeridas) usa estas restricciones; courses y ai-generation las consumen vía servicio, no leyendo jsonb por su cuenta.
- La plantilla debe poder evolucionar (nuevos códigos o versiones de secciones) sin cambiar la lógica de los demás módulos.

## Testing Strategy

- E2e: GET /api/templates devuelve ASFI_STANDARD con sus 5 secciones.
- Unitario: el validador de estructura acepta un outline válido y rechaza uno con menos módulos que minModules.

## Success Criteria

1. Seed idempotente: reinicios no duplican plantillas.
2. Otros módulos validan estructura consultando templates, sin constantes propias.
