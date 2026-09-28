# Plan técnico — student-view

Deriva de: docs/constitution.md (v2), docs/specs/SPEC-student-view.md (v2), decisión D8 del mapa.
Rama: develop. Sin código en este documento: solo QUÉ construir, CÓMO estructurarlo y CÓMO verificarlo.

## 1. Módulos

### Backend (NestJS)

| Módulo | Responsabilidad | RF que cubre |
|---|---|---|
| students | Identidad sin contraseña: registro/ingreso por nombre+correo, validación de formato, recuperación por correo, sesión de navegador | RF-01 a RF-05 |
| enrollments | Inscripción única por curso, "Mis cursos", progreso de lecciones (marcar/desmarcar), cálculo de avance, finalización del curso | RF-06 a RF-12, RF-27, RF-28, RF-29, RF-30 |
| question-banks | Banco de preguntas por curso: generación asistida, edición docente, plantillas de variación, aprobación explícita | RF-14 a RF-17, RF-18 (parte de guardas) |
| attempts | Ciclo del intento: inicio con variantes, envío idempotente, calificación con rúbrica, feedback, enfriamiento, fallo de proveedor | RF-19 a RF-26, RF-31 (auditoría de intentos) |
| publication (amenda) | Guardas nuevas: banco aprobado + cuaderno con fuentes para publicar | RF-18 |
| ai (extensión AIProvider) | Tres operaciones nuevas: generar banco, generar variantes, calificar respuesta | RF-14, RF-19, RF-21, RF-22, RF-23 |

### Frontend (Vue)

| Vista | Responsabilidad | RF que cubre |
|---|---|---|
| Identidad del estudiante | Registro/ingreso, aviso de datos, cierre de sesión y cambio de estudiante | RF-01 a RF-05 |
| Catálogo estudiantil | Solo cursos PUBLISHED; "Mis cursos" con histórico incluido | RF-06, RF-08, RF-30 (mensajes) |
| Reproductor del curso | Orden fijo de componentes, navegación libre, marcado de lecciones, avance | RF-09 a RF-13 |
| Evaluación | Intento libro abierto, indicador de preparación, envío, resultados con feedback por pregunta, historial, enfriamiento visible | RF-19 a RF-26, RF-28 |
| Editor de banco (docente) | Generar, editar, eliminar, agregar preguntas, plantillas de variación, aprobar banco | RF-14 a RF-17 |

## 2. Modelo de datos

```
students                        -- RF-01..05
  id uuid pk
  name varchar(120)             -- nombre original; no se actualiza (B2)
  email varchar(200) unique
  createdAt timestamp

enrollments                     -- RF-07, RF-08, RF-27
  id int pk
  studentId uuid fk
  courseId int fk
  status varchar (IN_PROGRESS | COMPLETED)
  bestScore int null            -- mejor intento (B8)
  startedAt, completedAt
  unique (studentId, courseId)  -- inscripción única (RF-07)

lesson_progress                 -- RF-11, RF-12
  id int pk
  enrollmentId fk
  lessonId fk
  completedAt timestamp
  unique (enrollmentId, lessonId)   -- marcar/desmarcar = insert/delete

question_banks                  -- RF-14..17
  id int pk
  courseId int fk unique        -- un banco por curso (decisión D-3 del plan)
  status varchar (DRAFT | APPROVED)
  approvedAt timestamp null     -- aprobación explícita (RF-17)

questions                       -- RF-14..16, RF-19, RF-20
  id int pk
  bankId fk
  position int
  caseText text                 -- enunciado del caso base
  prompt text                   -- la pregunta sobre el caso
  expectedConcepts jsonb        -- conceptos que la rúbrica debe buscar (RF-22, RF-23)
  sourceRefs jsonb              -- lecciones/fuentes que sustentan la respuesta
  variationTemplate jsonb       -- qué puede variar entre intentos (RF-16, RF-19)

attempts                        -- RF-19..26
  id uuid pk
  enrollmentId fk
  courseId fk
  status varchar (PREPARING | IN_PROGRESS | GRADING | GRADED | GRADING_FAILED)
  startedAt, submittedAt
  score int null                -- promedio 0-100 (RF-21)
  -- el enfriamiento se deriva del último intento GRADED del enrollment (RF-24)

attempt_questions               -- RF-19..23
  id int pk
  attemptId fk
  questionId fk
  variantCase text              -- texto exacto presentado (variación persistida)
  answer text null
  score int null                -- 0-100 por pregunta (RF-21)
  feedback text null            -- conceptos faltantes + referencia (RF-23)
```

Notas: sin migraciones formales (constitución implícita del proyecto: synchronize en MVP); auditoría existente registra las acciones de RF-31 reutilizando audit_logs.

## 3. Decisiones justificadas

| # | Decisión | Alternativa descartada y por qué |
|---|---|---|
| D-1 | Identidad por correo sin contraseña, progreso consultable por email | UUID anónimo por navegador: perdía el progreso al cambiar de equipo, contrario a RF-02/RF-10. Auth completa con contraseña: fuera de alcance por D3 del mapa y conversadora para un MVP. |
| D-2 | Progreso normalizado en lesson_progress (insert/delete) | Blob jsonb de lecciones en enrollment: consultas por lección y auditoría más frágiles, y el desmarcado (A3) requeriría reescrituras del blob. |
| D-3 | Un único banco por curso (unique) | Bancos versionados: el contenido publicado es inmutable (RF-13) y la corrección post-publicación está fuera de alcance; versionar hoy añade complejidad sin consumidor. |
| D-4 | Variantes generadas al iniciar el intento y persistidas en attempt_questions | Pool pre-generado: consume IA para intentos que quizá nunca ocurran. Generar al vuelo sin persistir: la calificación y revisión necesitan el texto exacto presentado al estudiante. |
| D-5 | Calificación síncrona con reintentos dentro de la misma solicitud y estado GRADING persistido | Cola asíncrona (Bull/Redis): dependencia nueva contra constitución 6; el volumen del MVP no la justifica y maxDuration actual la vuelve innecesaria. |
| D-6 | Enfriamiento calculado desde el último intento GRADED (sin tabla de bloqueos) | Tabla/caché de bloqueos: más estado que mantener para una regla consultable con un índice simple. |
| D-7 | Extender la interfaz AIProvider con generateQuestionBank, generateVariants y gradeAnswer | Servicio de IA paralelo para evaluación: fragmenta el punto único de abstracción que exige la constitución 8 y duplicaría el manejo de contexto cerrado. |
| D-8 | Calificador determinista para tests: puntúa por presencia de conceptos esperados; el caso "respuesta genérica sin sustento" se simula con marcador en la respuesta | Probar contra Gemini real en la suite: no determinista, costo y red en cada corrida; la constitución 4 exige automatización reproducible (los criterios 6 y 9 de la spec se verifican con este doble). |
| D-9 | Vistas de estudiante dentro de la misma SPA (rutas /estudiante) | SPA separada: duplica build, deploy y design system sin requisito de aislamiento; la separación real llegará con auth (D3). |
| D-10 | Publicación evalúa guardas nuevas en el módulo publication, consultando question-banks por servicio | Duplicar la validación en courses: dos fuentes de verdad para la misma regla (RF-18). |

## 4. Estrategia de tests

### Unitarios (Jest)

- Cálculo de avance: marcadas/total, secciones fijas excluidas — RF-12.
- Validador de identidad: nombre ≥2, formato de correo — RF-01, RF-04.
- Regla de enfriamiento: 10 min desde último GRADED — RF-24.
- Calificador mock: conceptos presentes → alto; respuesta vacía → 0; sin sustento → ≤50 con motivo — RF-21, RF-22.
- Aprobación de banco: exigir ≥1 pregunta y estado APPROVED — RF-17.
- Finalización: solo con todas las lecciones y evaluación aprobada — RF-27.

### E2E (Supertest contra Postgres, AI en modo mock)

Recorrido completo y casos límite, en una suite ordenada:

1. Registro inválido rechazado sin crear nada — RF-04.
2. Registro válido; reingreso con mismo correo y otro nombre conserva el original — RF-01, RF-02, RF-03.
3. Catálogo solo PUBLISHED; curso no publicado para no inscrito responde "no existe" — RF-06, RF-30.
4. Inscripción única (segunda inscripción idempotente) y auditoría de inscripción — RF-07, RF-31.
5. Marcado/desmarcado de lecciones y porcentaje inmediato — RF-11, RF-12.
6. Flujo docente: generar banco → editar pregunta → aprobar; publicar sin banco rechazado; publicar sin fuentes rechazado; con ambos, publica — RF-14 a RF-18.
7. Intento: inicio genera variantes persistidas, 5 preguntas muestreadas — RF-19, RF-20.
8. Envío idempotente; calificación promedio; respuesta sin sustento ≤50 con motivo; feedback con referencia a fuente — RF-21, RF-22, RF-23.
9. Segundo intento antes de 10 min rechazado por enfriamiento — RF-24.
10. Aprobación ≥70 marca evaluación aprobada; curso completado solo con lecciones completas — RF-26, RF-27.
11. Intento tras aprobar permitido; bestScore conserva el mayor — RF-24, B8.
12. Archivado: fuera de catálogo, accesible desde Mis cursos para inscrito, "no existe" para nuevo — RF-29, RF-30.
13. Fallo forzado del calificador: intento GRADING_FAILED, sin desprobación registrada — RF-25.
14. Auditoría con inscripción, finalización e intentos — RF-31.

### Frontend (Vitest)

- Helpers: porcentaje, chips de estado, cuenta regresiva de enfriamiento — soporte de RF-12, RF-24.
- Store del intento con API simulada: estados PREPARING→IN_PROGRESS→GRADED — soporte de RF-19 a RF-23.

### Regla de cierre (constitución 4 y 5)

Ninguna tarea se considera terminada sin su prueba correspondiente en verde; los RF no deterministas por naturaleza (variantes reales, rúbrica real de Gemini) quedan cubiertos por el doble determinista (D-8) y por una verificación manual documentada que se ejecutará una vez conectada la API key.

## 5. Orden de construcción (para derivar tareas)

```
1. students (identidad)          → RF-01..05
2. enrollments + progreso        → RF-06..12, RF-27..30 (sin evaluación aún)
3. question-banks + guardas      → RF-14..18 (amenda publication)
4. ai: banco y variantes (mock)  → RF-14, RF-19, RF-20
5. attempts + calificación       → RF-19..26
6. vistas frontend (estudiante + banco docente) → todas
7. e2e completo + validación     → criterios 1..10 de la spec
```
