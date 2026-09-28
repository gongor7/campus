# SPEC — Campus ASFI Inteligente (MVP)

Versión: 1.0 · Fecha: 2026-09-23
Estado: Pendiente de aprobación
Documento base: `docs/MVP.md` · Constitución: `docs/CONSTITUTION.md`

---

## 1. Objetivo

Especificar de forma verificable la primera versión del **simulador interactivo de aprendizaje** de Campus ASFI: un usuario completa una simulación basada en escenarios, toma decisiones, recibe consecuencias y retroalimentación, y visualiza su desempeño final, con lógica determinística y sin IA.

## 2. Decisiones de especificación (cerradas)

| # | Decisión |
|---|----------|
| D1 | El contenido de la simulación piloto lo redacta el equipo de desarrollo a partir del ejemplo del documento MVP (crecimiento de cartera + aumento de mora). |
| D2 | Sin autenticación. Los intentos se asocian a un `sessionId` anónimo (UUID en localStorage). |
| D3 | Ejecución local: solo PostgreSQL en Docker (compose); backend y frontend con `npm run dev`. |
| D4 | Desempeño final: **puntaje acumulado** (suma de puntajes de las decisiones tomadas, 0–100 cada una) contra el máximo alcanzable del camino recorrido. |
| D5 | Reintentos **ilimitados**; cada intento queda registrado por separado. |
| D6 | Retroalimentación por decisión **cualitativa** (consecuencia + explicación); el puntaje solo se revela en el resultado final. |
| D7 | El MVP entrega **exactamente una simulación**; el catálogo y las vistas son genéricos para soportar más en el futuro sin cambios de código. |

## 3. Alcance funcional (requisitos)

### RF-01 Catálogo de simulaciones
- RF-01.1 El usuario puede ver el listado de simulaciones disponibles (en el MVP: una).
- RF-01.2 El usuario puede consultar objetivo y descripción de una simulación antes de iniciarla.
- RF-01.3 El usuario puede iniciar una simulación, lo que crea un intento.

### RF-02 Escenarios
- RF-02.1 Cada escenario muestra: contexto, información relevante (incluye tablero de indicadores con valores), y una pregunta o situación con alternativas.
- RF-02.2 El escenario presentado al usuario depende de la decisión tomada en el escenario anterior (navegación adaptativa por árbol definido en datos).
- RF-02.3 El primer escenario de la simulación es fijo.

### RF-03 Decisiones y evaluación
- RF-03.1 Cada alternativa tiene asociados: consecuencia, retroalimentación cualitativa, puntaje (0–100) y siguiente escenario (`null` = fin de la simulación).
- RF-03.2 La evaluación es determinística y reside íntegramente en el backend (servicio de evaluación aislado del resto).
- RF-03.3 Tras cada decisión, el sistema muestra la consecuencia y la retroalimentación, sin revelar el puntaje.
- RF-03.4 No se puede decidir dos veces en el mismo escenario dentro de un intento.

### RF-04 Resultado final
- RF-04.1 Al llegar a una decisión terminal, el intento se marca como completado.
- RF-04.2 El resultado muestra: puntaje obtenido, máximo alcanzable del camino recorrido, listado de decisiones tomadas con su retroalimentación, y opción de reintentar.

### RF-05 Reintentos
- RF-05.1 El usuario puede iniciar un intento nuevo de la misma simulación sin límite; los intentos previos no se modifican.

## 4. Fuera de alcance

Todo lo listado en la sección 7 del documento MVP: LLM, chatbot, RAG, embeddings, generación automática de contenido/escenarios, evaluación por IA, perfiles, recomendaciones, panel administrativo, móvil, gamificación, rankings, certificados, integraciones. Además: autenticación, multi-usuario real, edición de contenido vía interfaz.

## 5. Contenido de la simulación piloto (resumen)

**Título:** Análisis de supervisión — crecimiento de cartera y aumento de mora.
**Estructura:** ~7 escenarios encadenados con ramificación A/B/C. El caso: una entidad de intermediación financiera presenta crecimiento acelerado de la cartera de créditos concurrente con aumento del índice de mora; el usuario, en rol de supervisor, decide qué analizar, cómo profundizar y qué medida requerir. Los caminos divergen según el enfoque elegido (análisis analítico de indicadores, revisión de políticas/concentración, visita in situ), convergen en un tramo final de decisión de requerimiento de supervisión y terminan en escenarios de cierre distintos.
El detalle narrativo (textos, indicadores del tablero, feedback y puntajes) se materializa en el seed del backend y forma parte de la verificación de aceptación.

## 6. Modelo de datos (PostgreSQL)

- `simulations`: id, slug, title, objective, description, created_at.
- `scenarios`: id, simulation_id, code, title, context, information (jsonb: tablero de indicadores, documentos, notas), question, order_hint. Unique (simulation_id, code).
- `decisions`: id, scenario_id, code, label, consequence, feedback, score (int 0–100), next_scenario_id (nullable FK a scenarios).
- `attempts`: id (uuid), session_id (uuid), simulation_id, current_scenario_id (nullable), status (`in_progress` | `completed`), score (int, default 0), max_score (int, default 0), created_at, completed_at.
- `attempt_steps`: id, attempt_id, scenario_id, decision_id, position (int), created_at. Unique (attempt_id, scenario_id).

## 7. API (REST, prefijo `/api`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/simulations` | Listado de simulaciones. |
| GET | `/simulations/:id` | Detalle (objetivo, descripción). |
| POST | `/attempts` | `{ simulationId, sessionId }` → crea intento y devuelve intento + primer escenario (sin exponer puntajes de las decisiones). |
| GET | `/attempts/:id` | Estado del intento + escenario actual. |
| POST | `/attempts/:id/decisions` | `{ decisionId }` → guarda el paso, suma puntaje, devuelve consecuencia, retroalimentación, puntaje máximo incremental del paso y siguiente escenario o `completed: true`. **No devuelve el puntaje obtenido.** |
| GET | `/attempts/:id/result` | Solo si está completado: puntaje final, máximo del camino, pasos con feedback. |

Errores: 400 para decision/scenario inconsistente con el intento, decisión repetida o intento completado; 404 para recursos inexistentes.

## 8. Frontend (Vue 3)

- `/` — catálogo de simulaciones (card con título, objetivo, descripción, botón iniciar).
- `/simulations/:id` — detalle y confirmación de inicio.
- `/attempts/:id` — vista de juego: contexto, tablero de indicadores (ficha de supervisión), información relevante, pregunta, alternativas; tras decidir, panel de consecuencia + retroalimentación con botón "Continuar"; indicador de progreso (escenarios recorridos).
- `/attempts/:id/result` — resumen: puntaje, máximo del camino, camino tomado con feedback por decisión, botón reintentar.
- Pinia para el estado del intento; `sessionId` anónimo persistido en localStorage; proxy `/api` al backend.

## 9. Requisitos no funcionales

- RNF-01 Toda la lógica de negocio y evaluación reside en el backend (Constitución #2).
- RNF-02 El motor de evaluación es un módulo aislado y sustituible sin modificar controladores ni persistencia (Constitución #8).
- RNF-03 Sin dependencias externas innecesarias; sin dependencias de IA (Constitución #6, #7).
- RNF-04 El seed es idempotente y carga el contenido completo al arranque.
- RNF-05 La UI es funcional y legible; no se requiere identidad visual pulida en el MVP.

## 10. Pruebas (Constitución #4, #5)

- **Backend (Jest, e2e Supertest):**
  - T1: crear intento devuelve el primer escenario de la simulación.
  - T2: decisión válida guarda el paso y devuelve consecuencia, feedback y siguiente escenario correcto según `next_scenario_id`.
  - T3: decisión terminal marca el intento completado.
  - T4: decisión repetida / decisión de otro escenario / decisión en intento completado → 400.
  - T5: `result` devuelve puntaje acumulado y máximo del camino correctos para un camino dado; antes de completar → error.
  - T6: `POST /decisions` no expone el puntaje de la decisión.
  - T7: el seed es idempotente (doble arranque no duplica contenido) y la simulación sembrada tiene todos los `next_scenario_id` resueltos (referencias válidas).
  - Unitarios del servicio de evaluación.
- **Frontend:** pruebas unitarias mínimas del store (flujo de decisión con API mockeada).
- Los tests deben pasar antes de considerar terminada cualquier tarea (Constitución #5).

## 11. Criterios de aceptación

1. Un usuario puede: ver el catálogo, consultar el detalle, iniciar la simulación, recorrer escenarios tomando decisiones, ver consecuencia y feedback tras cada decisión, completar la simulación por al menos dos caminos distintos y ver su resultado con puntaje.
2. El feedback por decisión no revela puntajes; estos aparecen solo en el resultado final.
3. Puede reiniciar la simulación sin límite y ambos intentos quedan registrados.
4. La suite de tests del backend pasa en su totalidad.
5. `docker compose up -d` (Postgres) + `npm run start:dev` (backend) + `npm run dev` (frontend) levantan la experiencia completa según README.

## 12. Plan de fases de implementación

1. Estructura del repositorio + docker-compose (Postgres) + README.
2. Backend: esquema de entidades y migración/seed con la simulación piloto completa.
3. Backend: módulo de intentos + motor de evaluación + endpoints, con tests e2e.
4. Frontend: catálogo y detalle de simulación.
5. Frontend: vista de juego (escenario, decisión, feedback, progreso).
6. Frontend: resultado final y reintentos.
7. Validación de punta a punta de los dos caminos + documentación final.
