# SPEC — audit

Estado: BORRADOR — pendiente de revisión.
Módulo: audit (docs/capability-map.md). Transversal: todos los módulos lo usan.

## Objetivo

Registrar toda operación relevante del sistema (quién, qué operación, sobre qué recurso, cuándo, resultado) para trazabilidad institucional (PROMPT-MAESTRO sección 20). Se construye temprano porque courses, source-sets, ai-generation y publication lo usan desde su primer día.

## Modelo de datos

```
audit_logs
  id            bigint pk
  actor         varchar(100)   -- MVP: 'docente' fijo (auth diferido, D3); luego userId
  action        varchar(50)    -- COURSE_CREATED, SOURCES_UPLOADED, GENERATION_RUN, COURSE_PUBLISHED...
  resourceType  varchar(50)    -- COURSE, SOURCE_SET, GENERATION...
  resourceId    varchar(64)
  detail        jsonb null     -- contexto: templateId, provider, fase, resultado
  result        varchar(20)    -- SUCCESS | ERROR
  createdAt     timestamp
```

## API

- `GET /api/audit?resourceType=&resourceId=` — listado filtrado por recurso (uso administrativo; MVP sin paginación compleja, orden descendente por fecha, límite 200).
- Sin endpoints de escritura: solo el servicio interno `AuditService.log(...)` que los demás módulos invocan.

## Reglas

- Toda operación que cambia estado del curso, fuentes, generación o publicación debe dejar exactamente un registro.
- Los registros de auditoría son inmutables: sin update ni delete.
- El registro de auditoría nunca debe romper la operación principal: si falla el log, la operación se completa y el error se registra en logs del servidor.

## Testing Strategy

- Unitario: cada acción auditable de modules posteriores exige su fila en audit_logs (se verifica dentro de sus propios e2e).
- E2e propio: GET /api/audit devuelve registros creados por operaciones previas del test.

## Success Criteria

1. Un e2e que crea un recurso y consulta /api/audit encuentra la fila correspondiente con actor, action, resourceType, resourceId, result y fecha.
2. Ningún módulo posterior se integra sin pasar audit por sus operaciones de estado.
