# Constitution — Campus ASFI

Versión 2 (2026-09-28). Sustituye a la constitución de la fase del simulador
(docs/archive/CONSTITUTION.md), cuya regla de no depender de LLM quedó obsoleta
con el propósito institucional actual.

1. El stack base es TypeScript en todo el código: NestJS en backend, Vue en frontend y PostgreSQL como persistencia.
2. La lógica de negocio reside en el backend y no depende de la interfaz.
3. El código se mantiene modular, legible y con responsabilidades claramente separadas.
4. Todo requisito funcional cuenta con pruebas automatizadas cuando sea técnicamente aplicable; lo no determinista se verifica con dobles deterministas y validación documentada.
5. Los tests se ejecutan antes de considerar una tarea terminada.
6. No se incorporan dependencias externas innecesarias.
7. La IA es una capacidad asistida de la institución: propone y califica aplicando reglas definidas por la institución. El docente mantiene el control editorial: todo contenido visible para estudiantes deriva de contenido o plantillas aprobadas por el docente.
8. La arquitectura mantiene desacoplado el proveedor de IA (abstracción AIProvider); el dominio no depende de Gemini, NotebookLM ni otro proveedor concreto.
9. No se implementa funcionalidad que no esté respaldada por una spec aprobada; los cambios de requisito se reflejan primero en la spec.
10. Las llamadas a IA operan con contexto cerrado: exclusivamente el material del curso y sus fuentes; sin herramientas de búsqueda externa.
11. Las operaciones relevantes quedan auditadas: quién, qué operación, sobre qué recurso, cuándo y con qué resultado.
12. Los secretos viven solo en variables de entorno; nunca en el frontend ni en el repositorio.
13. Las tareas de implementación son pequeñas (menos de 30 minutos), verificables y corresponden a una tarea específica del plan aprobado.
14. Sin emojis en documentación, código, interfaces ni mensajes del sistema.
15. Toda decisión técnica prioriza mantenibilidad, seguridad, trazabilidad, experiencia de usuario, independencia razonable de proveedores y cumplimiento institucional.
