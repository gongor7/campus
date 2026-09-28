# SPEC — student-view (vista del estudiante y evaluación razonada)

Estado: v2 — incorpora las decisiones de la revisión QA (2026-09-28).
Módulo: student-view (rama `develop`).

## Objetivo (QUÉ y POR QUÉ)

Permitir que un estudiante consuma los cursos publicados del Campus ASFI y demuestre su aprendizaje mediante una evaluación que exige razonamiento en lugar de memoria copiable. El propósito es cerrar el ciclo del producto (docente publica, estudiante aprende) y validar la propuesta pedagógica institucional: el estudiante piensa, aplica el material oficial y quiere volver a intentarlo porque la evaluación despierta curiosidad.

## Registro de decisiones de la revisión QA

| Hallazgo | Decisión |
|---|---|
| A1 Completado | Curso completado = todas las lecciones marcadas Y evaluación aprobada (≥ 70). |
| A2 Archivado | El curso archivado sale del catálogo pero queda accesible a inscritos desde "Mis cursos", incluido quien reingresa con su correo en otro navegador. |
| C1 Material durante el examen | Libro abierto: el estudiante puede consultar el material durante el intento; las preguntas exigen aplicación, no recuerdo. |
| C2 Fallo de calificación | Reintento automático; si persiste, el intento queda en error informado y no cuenta. |
| C3 Costo/abuso | Enfriamiento: un intento calificado cada 10 minutos como máximo. |
| D2 Variantes vs revisión | Plantillas de variación aprobadas por el docente: cada pregunta define su caso base y qué puede variar; las variantes runtime son transformaciones acotadas de contenido aprobado. |
| D1 Constitución | Se redacta docs/constitution.md v2 (aprobación pendiente del usuario). |
| A3/A4 sesión | Se permite desmarcar lecciones; se define cierre de sesión y cambio de estudiante. |
| B1 Porcentaje | Porcentaje = lecciones marcadas / total de lecciones. Introducción, práctica, cierre y evaluación se muestran como pasos fijos, no ponderan. |
| B2 Mismo correo, otro nombre | Se conserva el nombre original; el nuevo se ignora. |
| B3/B4 Banco | Generable y editable en DRAFT y REVIEW; para publicar se exige banco aprobado explícitamente por el docente. |
| B5 Preguntas por intento | 5 preguntas por intento (parámetro configurable), muestreadas del banco. |
| B6 Momento de variantes | Al iniciar el intento, con indicador visible de preparación. |
| B7 Puntaje | Promedio simple de preguntas (0-100 cada una). Rúbrica: respuesta correcta en términos generales pero sin sustento en el material puntúa como máximo 50 en esa pregunta. |
| B8 Tras aprobar | Puede seguir intentando; el puntaje oficial del curso es el mejor intento. |
| B9 Retención | Historial de intentos completo, sin límite en esta fase. |
| C4 Doble envío | El reenvío del mismo intento se ignora (idempotente). |
| C5 Respuestas vacías | Permitidas; puntúan 0. |
| C6 Sin cuaderno | Para publicar se exige cuaderno con al menos una fuente (endurece SPEC-publication). |
| C7 Corrección post-publicación | Fuera de alcance: la vía es archivar y republicar. |
| C8/C9 Datos personales | Registro con aviso de una línea sobre el tratamiento de datos; retención indefinida en esta fase; suplantación por correo ajío documentada como riesgo aceptado (sin contraseñá por decisión de diseño). |
| C10 Completado y archivado | Los cursos completados siguen visibles en "Mis cursos" como histórico. |
| C11 Vista docente del progreso | Fuera de alcance en esta spec. |
| C12 Tiempo por intento | Sin límite de tiempo. |
| D3 IA autoridad | La IA aplica la rúbrica institucional definida por humanos; la calificación queda trazada y auditable. |
| D5 Impacto cruzado | SPEC-publication y SPEC-courses se amendan en esta misma revisión. |
| E1/E2 editorial | Redacción corregida; RFs reformulados como comportamiento observable. |

## Requisitos funcionales (EARS)

### Identidad y sesión

- RF-01: Cuando un estudiante ingrese por primera vez, el sistema deberá solicitar nombre (mínimo 2 caracteres) y correo con formato válido, sin contraseña, mostrando un aviso de una línea sobre el tratamiento de sus datos.
- RF-02: Cuando el correo ingresado ya exista, el sistema deberá recuperar su progreso y conservar el nombre registrado originalmente, ignorando cualquier nombre distinto.
- RF-03: Cuando el correo no exista, el sistema deberá crear un registro nuevo de estudiante.
- RF-04: Cuando los datos ingresados no cumplan el formato, el sistema deberá rechazar el ingreso con mensaje claro, sin crear registros.
- RF-05: El sistema deberá permitir cerrar sesión y permitir que otro estudiante se identifique en el mismo navegador.

### Catálogo e inscripción

- RF-06: El sistema deberá mostrar en el catálogo únicamente los cursos con estado PUBLISHED.
- RF-07: Cuando un estudiante solicite inscribirse a un curso publicado, el sistema deberá crear una única inscripción para ese estudiante y curso, y registrarla en auditoría.
- RF-08: El sistema deberá mostrar al estudiante su lista "Mis cursos" con los cursos inscritos, sea cual sea su estado, incluyendo archivados y completados como histórico.

### Consumo del curso

- RF-09: Cuando un estudiante abra un curso inscrito, el sistema deberá mostrar sus componentes en este orden: Introducción, Módulos 1..N con sus lecciones, Práctica, Evaluación, Cierre.
- RF-10: El sistema deberá permitir la navegación libre entre lecciones, sin bloqueos secuenciales.
- RF-11: El sistema deberá permitir marcar y desmarcar una lección como completada; solo ese marcado cuenta como avance.
- RF-12: Cuando cambie el marcado de lecciones, el sistema deberá recalcular el avance como lecciones marcadas sobre total de lecciones, de inmediato.
- RF-13: Mientras un curso esté PUBLISHED, el sistema deberá mostrar a los estudiantes el mismo contenido inmutable que fue aprobado.

### Banco de preguntas (flujo docente)

- RF-14: Mientras un curso esté en DRAFT o REVIEW, el sistema deberá permitir al docente generar un banco de preguntas de caso con respuesta abierta a partir del contenido del curso y de las fuentes de su cuaderno.
- RF-15: Las preguntas deberán exigir aplicar conceptos del material institucional a un caso, de modo que una respuesta genérica obtenida de un servicio de IA externo no alcance el puntaje de aprobación.
- RF-16: El sistema deberá permitir al docente revisar, editar, eliminar y agregar preguntas, y definir por pregunta la plantilla de variación: caso base y parámetros de lo que puede variar entre intentos.
- RF-17: El sistema deberá permitir aprobar explícitamente el banco de preguntas; la aprobación solo procede con al menos una pregunta.
- RF-18: Cuando el docente solicite publicar, el sistema deberá verificar banco aprobado y cuaderno con al menos una fuente; si falta alguno, deberá rechazar la publicación indicando el motivo.

### Evaluación

- RF-19: Cuando un estudiante inicie un intento, el sistema deberá presentarlo como libro abierto —con el material del curso consultable— tras generar las variantes definidas por las plantillas aprobadas, mostrando un indicador de preparación mientras tanto.
- RF-20: Cada intento deberá presentar 5 preguntas muestreadas del banco (parámetro configurable).
- RF-21: Cuando el estudiante envíe un intento, el sistema deberá calificarlo calculando el promedio de las preguntas (0-100 cada una) aplicando la rúbrica institucional contra el contenido y las fuentes del curso; el reenvío del mismo intento deberá ignorarse.
- RF-22: Cuando una respuesta no se sustente en el material del curso, el sistema deberá asignarle como máximo 50 puntos y explicar el motivo en el feedback, aunque sea correcta en términos generales.
- RF-23: Tras cada intento, el sistema deberá entregar feedback formativo por pregunta: conceptos faltantes y qué lección o fuente los desarrolla.
- RF-24: El sistema deberá permitir intentos ilimitados, con un enfriamiento mínimo de 10 minutos entre intentos calificados; tras aprobar, el estudiante podrá seguir intentando y el puntaje oficial será el mejor intento.
- RF-25: Si la calificación de un intento falla por error del proveedor, el sistema deberá reintentarla automáticamente y, si persiste, informar al estudiante dejando el intento sin efecto y sin registro de desaprobación.
- RF-26: Cuando un intento alcance o supere 70 puntos, el sistema deberá marcar la evaluación como aprobada para ese estudiante.

### Finalización y casos límite

- RF-27: El sistema deberá marcar el curso como completado únicamente cuando el estudiante tenga todas las lecciones marcadas y la evaluación aprobada.
- RF-28: Al completarse el curso, el sistema deberá mostrar una pantalla con historial de intentos, mejor puntaje y fecha de finalización.
- RF-29: Cuando un curso PUBLISHED sea archivado, el sistema deberá retirarlo del catálogo y mantenerlo accesible y terminable desde "Mis cursos" para quienes estén inscritos, conservando su progreso.
- RF-30: Si un estudiante solicita un curso inexistente o no publicado en el que no esté inscrito, el sistema deberá responder que no existe, sin exponer contenido.
- RF-31: El sistema deberá registrar en auditoría las acciones relevantes del estudiante: inscripción, marcado de finalización de curso y cada intento de evaluación con su resultado.

## Fuera de alcance

- Certificados de aprobación.
- Autenticación con contraseña, administración de estudiantes, roles de estudiante en el panel docente.
- Visibilidad docente del progreso y resultados de estudiantes (futura spec de analítica).
- Ranking, insignias u otra gamificación distinta del reintento con variantes.
- Tutor de IA conversacional (feature siguiente).
- Generación de material adicional para estudiantes (audio, video, infografías, mapas mentales).
- RAG, base vectorial, embeddings.
- Notificaciones por correo, recordatorios, límite de tiempo por intento.
- Corrección de contenido tras publicar (la vía es archivar y republicar).
- Adaptatividad del contenido según desempeño.

## Criterios de finalización

1. Un estudiante nuevo se identifica (nombre y correo con validación), ve el catálogo de publicados, se inscribe, recorre lecciones con navegación libre, las marca/desmarca y ve su porcentaje recalculado.
2. Al reingresar con el mismo correo desde otro navegador retoma su progreso; el nombre original se conserva aunque ingrese otro.
3. Publicación bloqueada sin banco aprobado o sin fuentes en el cuaderno, con motivo claro.
4. Flujo de evaluación completo: intento de 5 preguntas con variantes, libro abierto, calificación 0-100 con rúbrica, feedback formativo con referencias, aprobación al alcanzar 70.
5. Un segundo intento respeta el enfriamiento de 10 minutos y presenta variantes distintas dentro de las plantillas aprobadas.
6. En la suite con calificador determinista: respuesta sin sustento en el material obtiene como máximo 50 en esa pregunta con motivo en el feedback.
7. Curso completado solo con todas las lecciones y evaluación aprobada; pantalla de finalización con historial y mejor puntaje.
8. Curso archivado: fuera del catálogo, accesible y terminable desde "Mis cursos" para inscritos; "no existe" para no inscritos.
9. Fallo simulado del calificador: reintento automático y, si persiste, intento sin efecto ni registro de desaprobación.
10. Acciones del estudiante presentes en auditoría.

## Notas y dependencias

- La calificación y las variantes requieren IA real (Gemini con API key); para desarrollo y suite de tests se usarán calificador y generador de variantes deterministas, equivalentes al patrón mock existente.
- Esta spec amend SPEC-publication (guarda de publicación con banco y fuentes) y SPEC-courses (acceso a archivados por inscritos); el mapa de capacidades incorpora el módulo student-view.
