# SPEC — ai-generation

Estado: BORRADOR — pendiente de revisión.
Módulo: ai-generation (docs/capability-map.md). Decisiones clave: D2 (Gemini + API key), D6 (contexto cerrado), D7 (dos fases).

## Objetivo

Transformar un curso con cuaderno vinculado en una propuesta estructurada, en dos fases: (A) propuesta de estructura editable, (B) contenido lección por lección. La IA propone dentro de la plantilla institucional; el docente decide (PROMPT-MAESTRO secciones 8-11).

## Abstracción de proveedor

```typescript
interface AIProvider {
  generateOutline(input: OutlineInput): Promise<OutlineProposal>;
  generateLessonContent(input: LessonInput): Promise<LessonContent>;
}
```

Implementaciones: `GeminiProvider` (producción) y `MockProvider` (tests/dev sin costo ni red). El dominio depende solo de la interfaz; el proveedor se selecciona por configuración (`AI_PROVIDER=gemini|mock`, por defecto gemini; `GEMINI_API_KEY` y `GEMINI_MODEL` en variables de entorno, nunca en código).

## Regla de contexto cerrado (dura)

- El request al proveedor contiene exclusivamente: fuentes del cuaderno vinculado + plantilla + datos del curso + reglas pedagógicas.
- Prohibido activar herramientas de búsqueda externa (google_search) u otro canal de información.
- Temperatura baja; salida con esquema JSON estricto validado por el backend; respuesta inválida = error, no "interpretación manual".
- Prioridad de información (PROMPT-MAESTRO sección 9): fuentes oficiales > datos del docente > reglas pedagógicas > derivación. Tema sin respaldo en fuentes → coverageGaps, nunca inventado.

## Fase A — propuesta de estructura

`POST /api/courses/:id/generate-outline`

Entrada efectiva: fuentes del cuaderno + plantilla + (objective, audience, level, targetHours).
Salida (guardada como outline del curso en estado propuesto, previa validación contra template):

```json
{
  "modules": [
    { "title": "...", "objective": "...", "estimatedMinutes": 120,
      "sourceRefs": ["doc.pdf"],
      "lessons": [ { "title": "...", "estimatedMinutes": 30 } ] }
  ],
  "sections": { "INTRODUCTION": "...", "PRACTICE": "...", "EVALUATION": "...", "CLOSING": "..." },
  "totalEstimatedMinutes": 480,
  "coverageGaps": [ { "topic": "...", "reason": "..." } ]
}
```

Reglas: total estimado debe tender a targetHours; cada módulo cita sus fuentes; brechas explícitas. Re-propone reemplazando la propuesta anterior (queda registro en generations).

## Fase B — contenido por lección

`POST /api/lessons/:id/generate-content`

Genera objective + content + sourceRefs de UNA lección, usando solo las fuentes asignadas a su módulo (ahorro de tokens y grounding más estricto). Es también la unidad de regeneración parcial (sección 11 del PROMPT-MAESTRO).

## Trazabilidad (sección 12)

```
course_generations
  id, courseId fk, phase (OUTLINE|LESSON), lessonId null,
  provider varchar, model varchar, actor,
  status (SUCCESS|ERROR), durationMs int, inputSummary jsonb, createdAt
```

Cada llamada deja una fila (audit además registra GENERATION_RUN).

## Testing Strategy

- Unitario con MockProvider: OutlineInput → propuesta válida; validador de esquema rechaza JSON inválido; el validador de template se aplica sobre la propuesta.
- E2e con MockProvider: flujo completo generar-outline → generar una lección sin red externa.
- GeminiProvider: prueba de integración manual opcional (costo centavos), no parte de la suite automática.

## Success Criteria

1. Con MockProvider, un curso con cuaderno obtiene outline válido y una lección con contenido — sin llamadas externas.
2. El esquema de respuesta es validado: JSON malformado produce 502 con mensaje claro, no datos corruptos.
3. Cada generación queda en course_generations y audit.
4. El código de dominio no referencia Gemini fuera de GeminiProvider.
