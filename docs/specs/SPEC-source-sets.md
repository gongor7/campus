# SPEC — source-sets

Estado: BORRADOR — pendiente de revisión.
Módulo: source-sets (docs/capability-map.md). Reemplaza al módulo notebooks (decisión D6).

## Objetivo

Cuadernos de fuentes institucionales nativos del Campus: el administrador sube los documentos oficiales UNA vez (PDF, PPTX, DOCX, TXT), y los cursos se vinculan al cuaderno para que la generación use exclusivamente ese material (contexto cerrado, decisiones D6 y D7).

## Modelo de datos

```
source_sets
  id, name varchar(100), description text null, createdAt

sources
  id, sourceSetId fk, filename varchar(255), mimeType varchar(100),
  sizeBytes int, storagePath varchar(500),  -- ubicación en Supabase Storage
  uploadedBy varchar, createdAt
```

Almacenamiento de archivos: bucket de Supabase Storage (misma infra ya usada; capa gratuita 1 GB). El archivo original queda preservado para auditoría y futuras regeneraciones.

## API

- `POST /api/source-sets` — crear cuaderno (nombre, descripción). Audit.
- `GET /api/source-sets` / `GET /api/source-sets/:id` — listado y detalle con sus fuentes.
- `POST /api/source-sets/:id/sources` — upload multipart (uno o varios archivos). Valida tipo y tamaño (máx. 20 MB por archivo en MVP). Audit.
- `DELETE /api/sources/:id` — quitar fuente (solo si ningún curso publicado la referencia; advertencia si hay cursos en curso). Audit.

## Reglas

- Tipos permitidos: application/pdf, PPTX, DOCX, TXT, MD.
- Un curso vincula UN cuaderno (sourceSetId); varios cursos pueden compartir el mismo cuaderno (reuso, la razón de ser del módulo).
- Los archivos no se exponen públicamente: el acceso es interno (generación) y de descarga autenticada.

## Testing Strategy

- E2e: crear cuaderno → subir PDF de prueba → verlo en el detalle del cuaderno → eliminarlo.
- Unitario: validación de tipo/tamaño rechaza archivos no permitidos.

## Success Criteria

1. Un PDF subido queda persistido (Storage + fila en sources) y listado en su cuaderno.
2. Un curso puede vincularse al cuaderno y ai-generation puede leer las fuentes desde ahí.
3. Operaciones auditadas.

## Open Questions

1. Confirmar Supabase Storage como almacén (recomendado) frente a guardar bytes en PostgreSQL — decisión antes de implementar el módulo.
