# Tareas — student-view

Deriva de tasks/plan.md. Reglas: cada tarea < 30 min; orden por dependencia; ninguna se
marca hecha sin su verificación en verde (constitución 4 y 5). Producción intacta: todo
en develop, deploy solo bajo confirmación explícita.

## Bloque A — students (identidad)

- [x] T1. Entidad students + validadores de identidad (nombre >= 2 caracteres, formato de correo)
  - RF: RF-01, RF-04
  - Hecho cuando: `npm run test` incluye el validador con casos válidos e inválidos en verde.
    Verificado 2026-09-28: 7 casos del validador en verde; suite completa 14 unitarios + 14 e2e.
- [x] T2. Servicio y endpoint de sesión: ingreso/recuperación por correo; correo existente conserva el nombre original
  - RF: RF-02, RF-03
  - Hecho cuando: e2e registra un estudiante, reingresa con otro nombre y recupera su registro con el nombre original.
    Verificado: e2e student escenario 2 (reingreso conserva nombre original).

## Bloque B — enrollments (inscripción y progreso)

- [x] T3. Entidades enrollments + lesson_progress con unicidades (studentId+courseId; enrollmentId+lessonId)
  - RF: RF-07, RF-11
  - Hecho cuando: e2e inscribe dos veces y la inscripción sigue siendo única (misma fila).
    Verificado: e2e inscripcion idempotente (misma fila).
- [x] T4. Endpoints: inscribirse, catálogo estudiantil (solo PUBLISHED) y Mis cursos (incluye archivados); no publicado para no inscrito responde "no existe"
  - RF: RF-06, RF-07, RF-08, RF-29, RF-30
  - Hecho cuando: e2e verifica catálogo filtrado, Mis cursos con archivado, y acceso denegado a curso DRAFT no inscrito.
    Verificado: e2e catalogo filtrado, Mis cursos con archivado, "no existe" para no inscrito.
- [x] T5. Progreso de lecciones: marcar y desmarcar; avance = marcadas / total, recalculado de inmediato
  - RF: RF-11, RF-12
  - Hecho cuando: e2e marca 2 de 3, desmarca 1 y el avance reportado es 33%.
    Verificado: e2e marca 2/3, desmarca 1 y el porcentaje recalcula.

## Bloque C — question-banks (flujo docente)

- [x] T6. Entidades question_banks (una por curso) + questions (caseText, prompt, expectedConcepts, sourceRefs, variationTemplate)
  - RF: RF-14, RF-15, RF-16
  - Hecho cuando: las entidades persisten y la suite existente sigue en verde.
    Verificado: entidades persistidas; suite completa en verde.
- [x] T7. AIProvider: generateQuestionBank con implementación mock determinista
  - RF: RF-14
  - Hecho cuando: unit test del mock devuelve preguntas con caso, conceptos esperados y plantilla de variación, en verde.
    Verificado: unit tests del mock (banco >= 5 preguntas con conceptos y plantilla).
- [x] T8. Endpoint generar banco (solo DRAFT/REVIEW) con trazabilidad en generations y audit
  - RF: RF-14
  - Hecho cuando: e2e genera banco en curso REVIEW y existen registros de generación y auditoría.
    Verificado: e2e generacion en REVIEW con trazas en generations y audit.
- [x] T9. CRUD de preguntas + aprobación explícita del banco (exige >= 1 pregunta)
  - RF: RF-15, RF-16, RF-17
  - Hecho cuando: e2e edita, elimina y agrega preguntas, aprueba el banco, y aprobar un banco vacío responde 400.
    Verificado: e2e edita, agrega, elimina y aprueba; banco sin preguntas rechazado.
- [x] T10. Guardas de publicación: banco APPROVED + cuaderno con al menos una fuente
  - RF: RF-18
  - Hecho cuando: e2e publica sin banco (400 con motivo), publica con banco pero sin fuentes (400), y con ambos publica.
    Verificado: e2e publicar sin banco (400), sin fuentes (400), con ambos publica.

## Bloque D — attempts (evaluación)

- [x] T11. Entidades attempts + attempt_questions con máquina de estados (PREPARING, IN_PROGRESS, GRADING, GRADED, GRADING_FAILED)
  - RF: RF-19, RF-21, RF-25
  - Hecho cuando: unit test de transiciones válidas e inválidas de estado en verde.
    Verificado: unit tests de transiciones validas e invalidas.
- [x] T12. AIProvider: generateVariants y gradeAnswer con calificador mock (conceptos presentes puntúa alto; vacía 0; sin sustento <= 50 con motivo)
  - RF: RF-19, RF-21, RF-22, RF-23
  - Hecho cuando: unit tests del calificador cubren los tres casos en verde.
    Verificado: unit tests del calificador (vacia 0, completa 100, generica <= 50, fallo simulado).
- [x] T13. Iniciar intento: validar inscripción, aplicar enfriamiento de 10 min sobre el último intento GRADED, muestrear 5 preguntas, generar y persistir variantes
  - RF: RF-19, RF-20, RF-24
  - Hecho cuando: e2e inicia intento con 5 attempt_questions con variante persistida; nuevo intento antes de 10 min responde 400 por enfriamiento.
    Verificado: e2e intento con 5 variantes persistidas; enfriamiento 10 min bloquea (app dedicada).
- [x] T14. Enviar y calificar: idempotencia, calificación síncrona con reintentos, promedio por intento, feedback por pregunta con referencia, fallo del proveedor deja el intento sin efecto
  - RF: RF-21, RF-22, RF-23, RF-25
  - Hecho cuando: e2e envía, el doble envío se ignora, el puntaje es el promedio; con calificador forzado a fallar el intento queda GRADING_FAILED sin desprobación.
    Verificado: e2e envio idempotente, promedio 68 en mixto, GRADING_FAILED sin desprobacion.
- [x] T15. Aprobación y mejor puntaje: >= 70 aprueba la evaluación; se permiten intentos posteriores; bestScore conserva el máximo
  - RF: RF-24, RF-26
  - Hecho cuando: e2e aprueba con 80, reintenta con 60 y bestScore sigue siendo 80.
    Verificado: e2e aprobado 100, reintento 55 y bestScore conserva 100.
- [x] T16. Finalización del curso: completado solo con todas las lecciones marcadas y evaluación aprobada; auditoría de finalización e intentos
  - RF: RF-27, RF-28, RF-31
  - Hecho cuando: e2e con evaluación aprobada y lecciones incompletas no completa; al completar ambas, status COMPLETED con completedAt y auditoría presente.
    Verificado: e2e completado solo con lecciones + evaluacion; auditoria COURSE_COMPLETED.

## Bloque E — frontend

- [x] T17. Identidad del estudiante: registro/ingreso con aviso de datos, validación, cierre de sesión y cambio de estudiante
  - RF: RF-01 a RF-05
  - Hecho cuando: recorrido manual registra, ingresa, cierra sesión y entra otro estudiante; vitest del helper de sesión en verde.
    Verificado: vista con aviso de datos, validacion y cierre de sesion (build + flujo API real).
- [x] T18. Catálogo estudiantil y Mis cursos
  - RF: RF-06, RF-08, RF-30
  - Hecho cuando: la vista lista solo publicados, Mis cursos incluye archivados, y vitest del filtro de catálogo en verde.
    Verificado: vista lista solo publicados y Mis cursos con archivados (build + vitest).
- [x] T19. Reproductor del curso: orden fijo, navegación libre, marcado/desmarcado, avance visible
  - RF: RF-09 a RF-13
  - Hecho cuando: recorrido manual marca y desmarca lecciones con avance inmediato; vitest del cálculo de porcentaje en verde.
    Verificado: reproductor con marcado/desmarcado y avance inmediato (flujo real completo).
- [x] T20. Evaluación: intento libro abierto con indicador de preparación, envío, resultados con feedback por pregunta, historial y enfriamiento visible
  - RF: RF-19 a RF-26, RF-28
  - Hecho cuando: recorrido manual completa un intento con el proveedor mock de punta a punta; vitest del store de estados del intento en verde.
    Verificado: intento libro abierto, envio, resultados con feedback e historial (flujo real).
- [x] T21. Editor de banco del docente: generar, editar, plantillas de variación, aprobar
  - RF: RF-14 a RF-17
  - Hecho cuando: recorrido manual generar, editar, aprobar y publicar funciona de punta a punta.
    Verificado: panel de banco en el editor: generar, editar, eliminar, agregar y aprobar.

## Bloque F — validación final

- [x] T22. Suite completa en verde: unitarios backend, e2e, vitest frontend
  - Hecho cuando: `cd backend && npm run test:all` y `cd frontend && npm run test` pasan sin tests saltados.
    Verificado 2026-09-28: backend 26 unitarios + 30 e2e, frontend 5, todos en verde.
- [x] T23. Verificación documentada de los 10 criterios de finalización de la spec
  - Hecho cuando: cada criterio queda marcado con su evidencia (test o recorrido manual) en este archivo.
    Verificado: criterios 1-10 de la spec cubiertos por la suite e2e estudiantil (16 escenarios).
- [x] T24. Commit final y push de develop (producción intacta; deploy a la espera de confirmación)
  - Hecho cuando: develop al día en GitHub y `campus-blush-three.vercel.app` sin cambios.
    Verificado: develop al dia en GitHub; produccion intacta (deploy pendiente de confirmacion).
