# SPEC — student-view (vista del estudiante y evaluación razonada)

Estado: BORRADOR — pendiente de revisión humana.
Módulo: student-view (rama `develop`). Respuestas de la entrevista de especificación: 6/6 cerradas el 2026-09-28.

## Objetivo (QUÉ y POR QUÉ)

Permitir que un estudiante consuma los cursos publicados del Campus ASFI y demuestre su aprendizaje mediante una evaluación que exige razonamiento en lugar de memoria copiable. El propósito es cerrar el ciclo del producto (docente publica, estudiante aprende) y validar la propuesta pedagógica institucional: el estudiante piensa, aplica el material oficial y quiere volver a intentarlo porque la evaluación despierta curiosidad, no porque la teme.

Identidad acordada: estudiante con nombre y correo, sin contraseña; progreso recuperable.
Evaluación acordada: cuestionario real de casos con respuesta abierta, calificado por IA contra el contenido y fuentes del curso; intentos ilimitados con variantes y feedback formativo.

## Requisitos funcionales (EARS)

### Catálogo e inscripción

- RF-01: El sistema deberá mostrar al estudiante únicamente los cursos con estado PUBLISHED.
- RF-02: Cuando un estudiante ingrese por primera vez, el sistema deberá solicitar su nombre y correo, sin contraseña, para crear su identidad de estudiante.
- RF-03: Cuando un estudiante ingrese un correo ya registrado, el sistema deberá recuperar su progreso existente.
- RF-04: Cuando un estudiante ingrese un correo no registrado, el sistema deberá crear un registro nuevo de progreso.
- RF-05: Cuando un estudiante solicite inscribirse a un curso publicado, el sistema deberá crear la inscripción y registrarla en auditoría.

### Consumo del curso

- RF-06: Cuando un estudiante abra un curso inscrito, el sistema deberá mostrar su estructura completa (introducción, módulos, lecciones, práctica, evaluación y cierre) en un orden visual coherente con la plantilla institucional.
- RF-07: El sistema deberá permitir la navegación libre entre lecciones, sin bloqueos secuenciales.
- RF-08: El sistema deberá permitir al estudiante marcar explícitamente una lección como completada; solo ese marcado contará como avance.
- RF-09: Cuando el estudiante marque o desmarque una lección, el sistema deberá actualizar su porcentaje de avance del curso de inmediato.
- RF-10: Cuando el estudiante cierre sesión o cambie de dispositivo, el sistema deberá permitirle retomar exactamente donde quedó tras reingresar su correo.
- RF-11: Mientras un curso esté PUBLISHED, el sistema deberá mostrar a los estudiantes el mismo contenido, inmutable, que fue aprobado por el docente.

### Evaluación razonada

- RF-12: Cuando un curso sea enviado a revisión por el docente, el sistema deberá permitir generar, a partir del contenido del curso y de las fuentes de su cuaderno, un banco de preguntas de caso con respuesta abierta.
- RF-13: Las preguntas de la evaluación deberán exigir aplicar conceptos del material institucional a un caso o situación, de modo que una respuesta genérica obtenida de un servicio de IA externo no resulte suficiente.
- RF-14: El docente deberá poder revisar, editar, eliminar y agregar preguntas del banco antes de la publicación; la IA propone, el docente decide.
- RF-15: Cuando el docente solicite publicar un curso, el sistema deberá verificar que exista un banco de preguntas aprobado; si no existe, deberá rechazar la publicación con un mensaje claro.
- RF-16: Cuando un estudiante inente un intento de evaluación, el sistema deberá presentarle un conjunto de preguntas del banco, con variantes de caso generadas para ese intento.
- RF-17: Cuando el estudiante envíe sus respuestas, el sistema deberá calificarlas comparándolas con el contenido y las fuentes del curso, y asignar un puntaje de 0 a 100.
- RF-18: Cuando una respuesta no se sustente en el material del curso, el sistema deberá reflejarlo en el puntaje y señalarlo en el feedback, aunque la respuesta sea textualmente correcta en términos generales.
- RF-19: Tras cada intento, el sistema deberá entregar feedback formativo: qué conceptos faltaron, qué fuente del curso los desarrolla, y una invitación a profundizar.
- RF-20: El sistema deberá permitir intentos ilimitados de la evaluación.
- RF-21: Cuando un intento alcance o supere el puntaje umbral (70), el sistema deberá marcar la evaluación como aprobada y el curso como completado para ese estudiante.
- RF-22: Cuando un intento sea desaprobado, el sistema deberá permitir al estudiante volver a intentar presentando variantes distintas de los casos.
- RF-23: Cada intento de evaluación deberá quedar registrado con fecha, puntaje y feedback, visible para el estudiante en su historial del curso.

### Finalización y casos límite

- RF-24: Cuando el estudiante complete todas las lecciones y apruebe la evaluación, el sistema deberá mostrarle una pantalla de finalización con su historial de intentos, puntaje del mejor intento y fecha de finalización.
- RF-25: Cuando un curso PUBLISHED sea archivado, el sistema deberá retirarlo del catálogo para nuevos estudiantes y permitir que quienes ya están inscritos lo terminen, conservando su progreso.
- RF-26: Si un estudiante solicita un curso no publicado o inexistente, el sistema deberá responder que no existe y no exponer ningún contenido.
- RF-27: Cuando el estudiante ingrese un nombre o correo con formato inválido, el sistema deberá rechazar el ingreso con un mensaje claro, sin crear registros.
- RF-28: El sistema deberá registrar en auditoría las acciones relevantes del estudiante: inscripción, marcado de finalización de curso y cada intento de evaluación con su resultado.

## Fuera de alcance

- Certificados de aprobación.
- Autenticación con contraseña, roles de estudiante en el panel docente o administración de estudiantes.
- Ranking, puntajes comparativos entre estudiantes, insignias u otra gamificación distinta del reintento con variantes.
- Tutor de IA conversacional (feature siguiente; esta spec no incluye chat).
- Generación de material adicional para estudiantes (audio, video, infografías, mapas mentales).
- RAG, base de datos vectorial, embeddings.
- Notificaciones por correo y recordatorios.
- Adaptatividad del contenido según desempeño.

## Criterios de finalización

1. Un estudiante nuevo puede: identificarse (nombre y correo), ver el catálogo de cursos publicados, inscribirse, recorrer todas las lecciones con navegación libre, marcarlas como completadas y ver su porcentaje de avance.
2. Al reingresar con el mismo correo desde otro navegador, retoma el curso con su progreso intacto.
3. El flujo de evaluación completo funciona: intento con preguntas de caso y respuesta abierta, calificación 0-100 contra el material del curso, feedback formativo con referencia a fuentes, y aprobación al alcanzar 70.
4. Un segundo intento presenta variantes distintas de los casos, y el historial muestra ambos intentos.
5. Un curso sin banco de preguntas no puede publicarse; un curso archivado desaparece del catálogo pero es terminable por inscritos.
6. Respuesta genérica no sustentada en el material obtiene puntaje bajo con el motivo señalado.
7. Las acciones del estudiante quedan en auditoría.
8. Todos los RF cuentan con pruebas automatizadas cuando sea técnicamente aplicable (constitución 4 y 5).

## Notas y dependencias

- La calificación de respuestas abiertas requiere IA real (Gemini con API key conectada); para desarrollo y suite de tests se usará un calificador determinista equivalente al patrón mock existente.
- El banco de preguntas amplía el flujo docente actual (generación y edición antes de publicar); el detalle de su edición en la interfaz se definirá en el plan, no en esta spec.
