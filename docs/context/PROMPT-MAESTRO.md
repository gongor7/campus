# Prompt Maestro — Campus ASFI

## 1. Contexto del proyecto

Se debe desarrollar desde cero una nueva plataforma educativa institucional denominada provisionalmente **Campus ASFI**, orientada a la capacitación y formación dentro de la Autoridad de Supervisión del Sistema Financiero (ASFI) de Bolivia.

El objetivo no es realizar una copia visual o funcional de Moodle, Chamilo u otro LMS tradicional.

Se busca construir una experiencia educativa institucional moderna, limpia, intuitiva y tecnológicamente actual, donde el usuario perciba desde el primer contacto que está utilizando una plataforma desarrollada específicamente para ASFI.

El sistema deberá mantener coherencia con la identidad institucional de ASFI y respetar los lineamientos visuales aplicables a una institución pública boliviana.

El sitio oficial actual de ASFI utiliza la denominación:

**Autoridad de Supervisión del Sistema Financiero — ASFI**

y mantiene información institucional, normativa, recursos de capacitación y documentación oficial en su portal institucional.

La identidad visual deberá investigarse y documentarse antes de implementar la interfaz definitiva. No se deben inventar colores institucionales ni modificar arbitrariamente el logotipo.

Debe considerarse además el Manual de Identidad de Imagen Gobierno aplicable a instituciones públicas del nivel central del Estado.

Referencia institucional:

https://www.asfi.gob.bo/

---

# 2. Objetivo de este MVP

El primer MVP tendrá un alcance deliberadamente reducido.

El objetivo es implementar únicamente el proceso mediante el cual un docente pueda:

1. Seleccionar o vincular las fuentes oficiales de conocimiento de un curso.
2. Crear un nuevo curso.
3. Utilizar inteligencia artificial para generar una propuesta inicial del curso basándose exclusivamente en las fuentes asociadas.
4. Recibir una estructura de curso basada en una plantilla institucional fija.
5. Revisar y modificar la propuesta.
6. Guardar el curso como borrador.
7. Publicar el curso cuando haya sido aprobado.

Este MVP NO debe implementar todavía:

* Chat tutor para estudiantes.
* RAG para estudiantes.
* Base de datos vectorial.
* Embeddings.
* Gamificación.
* Certificados.
* Ranking de estudiantes.
* Recomendaciones personalizadas.
* Generación avanzada de materiales para estudiantes.
* Agentes autónomos.
* Automatizaciones complejas.
* Sistema completo de evaluación del estudiante.
* Analítica avanzada de aprendizaje.

El objetivo de esta primera versión es demostrar correctamente el núcleo:

**Fuentes oficiales → IA → estructura de curso → revisión docente → publicación.**

---

# 3. Concepto principal

El Campus ASFI no debe depender de que el docente construya manualmente todo el curso.

La plataforma debe utilizar IA como asistente para transformar material institucional existente en una propuesta de curso estructurada.

La IA no debe tener libertad para inventar la arquitectura pedagógica del curso.

La estructura general del curso estará definida por ASFI.

Por lo tanto:

**La institución define la estructura.**

**La IA genera el contenido dentro de esa estructura.**

**El docente revisa y decide qué publicar.**

---

# 4. Fuentes de conocimiento

El modelo de conocimiento inicial del proyecto utilizará **NotebookLM Enterprise / Gemini Notebook Enterprise** como repositorio de fuentes institucionales asociado a los cursos.

La idea funcional es que ASFI pueda preparar previamente un Notebook con las fuentes oficiales necesarias para un curso.

Ejemplo:

```text
NotebookLM Enterprise

Curso: Gestión de Riesgos

Fuentes:
├── Ley / normativa correspondiente.pdf
├── Manual de Gestión de Riesgos.pdf
├── Reglamento institucional.pdf
├── Presentación oficial.pptx
└── Documento complementario.pdf
```

Posteriormente, el Campus ASFI vinculará ese Notebook con el curso.

El Campus no debe obligar al docente a volver a cargar las mismas fuentes si estas ya fueron preparadas institucionalmente.

La relación conceptual será:

```text
NotebookLM
      │
      │ contiene
      ▼
Fuentes oficiales
      │
      │ asociado a
      ▼
Curso ASFI
      │
      ▼
Generación mediante IA
```

El backend debe almacenar la referencia necesaria para identificar el Notebook asociado al curso.

Ejemplo conceptual:

```text
Course
- id
- name
- description
- notebookId
- status
- createdBy
- createdAt
- updatedAt
```

No se debe asumir que el NotebookLM será la única tecnología de IA utilizada en el futuro.

Debe diseñarse una abstracción que permita cambiar o complementar el proveedor de IA.

---

# 5. Arquitectura de IA

La aplicación no debe acoplar toda su lógica directamente a un proveedor específico.

Debe existir una capa de abstracción.

Ejemplo conceptual:

```typescript
interface AIProvider {
  generateCourseStructure(input: CourseGenerationInput): Promise<CourseDraft>;
}
```

La implementación inicial podrá utilizar Gemini.

Posteriormente podrían existir:

```text
GeminiProvider
NotebookLMProvider
OpenAIProvider
LocalAIProvider
```

El dominio del Campus ASFI no debería depender directamente de una implementación concreta.

---

# 6. Plantilla institucional del curso

Todos los cursos deberán utilizar una estructura institucional común.

La IA no debe decidir libremente si un curso tendrá módulos, evaluaciones, prácticas u otros componentes.

La plataforma debe disponer de una plantilla institucional.

Ejemplo conceptual:

```text
CURSO
│
├── Introducción
│
├── Módulo 1
│   ├── Lección 1
│   ├── Lección 2
│   └── Lección 3
│
├── Módulo 2
│   ├── Lección 1
│   └── Lección 2
│
├── Práctica
│
├── Evaluación
│
└── Cierre
```

La cantidad de módulos y lecciones puede variar dependiendo del contenido.

Lo que no debe variar arbitrariamente es el modelo pedagógico institucional.

La estructura debe ser configurable en el futuro mediante un sistema de plantillas.

Ejemplo conceptual:

```json
{
  "template": "ASFI_STANDARD",
  "sections": [
    {
      "type": "INTRODUCTION",
      "required": true
    },
    {
      "type": "MODULES",
      "required": true,
      "minItems": 1
    },
    {
      "type": "PRACTICE",
      "required": true
    },
    {
      "type": "EVALUATION",
      "required": true
    },
    {
      "type": "CLOSING",
      "required": true
    }
  ]
}
```

La plantilla debe poder evolucionar sin necesidad de modificar la lógica principal del sistema.

---

# 7. Flujo principal del MVP

## Paso 1 — Preparación de fuentes

El administrador prepara el Notebook correspondiente al curso.

```text
Administrador
      │
      ▼
NotebookLM Enterprise
      │
      ├── Fuente 1
      ├── Fuente 2
      ├── Fuente 3
      └── Fuente N
```

El sistema debe poder identificar el Notebook mediante su identificador.

---

## Paso 2 — Creación del curso

El docente ingresa al Campus ASFI.

Selecciona:

**Crear curso**

Debe proporcionar información básica como:

* Nombre.
* Descripción.
* Público objetivo.
* Nivel.
* Duración estimada.
* Objetivo general.
* Notebook asociado.
* Plantilla institucional.

---

# 8. Generación del curso

Una vez asociado el Notebook, el docente podrá seleccionar:

**Generar propuesta de curso**

El backend deberá construir la solicitud para el proveedor de IA utilizando:

* Información proporcionada por el docente.
* Plantilla institucional.
* Fuentes asociadas al Notebook.
* Reglas pedagógicas definidas por ASFI.

La IA deberá devolver una estructura estrictamente compatible con el modelo esperado por el backend.

No debe devolver HTML libre ni una respuesta textual que posteriormente tenga que interpretarse manualmente.

Debe utilizar un esquema estructurado.

Ejemplo:

```json
{
  "title": "Gestión de Riesgos",
  "description": "...",
  "objective": "...",
  "modules": [
    {
      "title": "Fundamentos de la Gestión de Riesgos",
      "description": "...",
      "lessons": [
        {
          "title": "Conceptos fundamentales",
          "objective": "...",
          "content": "..."
        }
      ]
    }
  ],
  "practice": {
    "title": "...",
    "description": "..."
  },
  "evaluation": {
    "title": "...",
    "description": "..."
  },
  "closing": {
    "summary": "..."
  }
}
```

El esquema definitivo debe establecerse mediante una Spec antes de implementar.

---

# 9. Regla fundamental de generación

La IA debe utilizar las fuentes asociadas como base del contenido.

No debe presentar información inventada como si proviniera de ASFI.

Cuando la información necesaria no se encuentre disponible en las fuentes, el sistema debe poder identificar esa situación.

La generación debe priorizar:

1. Fuentes oficiales.
2. Información proporcionada por el docente.
3. Reglas pedagógicas institucionales.
4. Generación de contenido derivado.

No debe introducir normativa, cifras, procedimientos o conceptos institucionales sin respaldo suficiente.

---

# 10. Revisión del docente

La generación de IA no implica publicación automática.

El flujo debe ser:

```text
GENERATED
    │
    ▼
DRAFT
    │
    ▼
REVIEW
    │
    ├── Editar
    ├── Regenerar
    └── Aprobar
            │
            ▼
        PUBLISHED
```

El docente debe poder modificar:

* Título.
* Descripción.
* Objetivos.
* Módulos.
* Lecciones.
* Contenido.
* Prácticas.
* Evaluación.
* Orden de elementos.

La IA es un asistente.

El docente mantiene el control editorial.

---

# 11. Regeneración

El docente debe poder solicitar regeneración de una parte específica sin tener que regenerar todo el curso.

Ejemplo:

```text
Curso
 ├── Módulo 1
 │    ├── Lección 1
 │    ├── Lección 2 ← Regenerar
 │    └── Lección 3
 │
 └── Módulo 2
```

Si el docente solicita regenerar una lección, el sistema debe limitar la operación a esa unidad cuando sea posible.

Esto evita generar nuevamente todo el curso y reduce consumo de tokens y costos de IA.

---

# 12. Versionado

Las generaciones realizadas mediante IA deben poder rastrearse.

No es necesario construir un sistema complejo de versionado en el primer MVP, pero la arquitectura debe permitirlo.

Debe ser posible conocer:

* Quién generó el contenido.
* Cuándo fue generado.
* Qué proveedor de IA se utilizó.
* Qué Notebook estaba asociado.
* Qué plantilla se utilizó.
* Qué versión de la generación fue aprobada.

Esto será importante para auditoría institucional.

---

# 13. Estados del curso

Como mínimo:

```text
DRAFT
REVIEW
PUBLISHED
ARCHIVED
```

Flujo:

```text
DRAFT
  │
  ▼
REVIEW
  │
  ▼
PUBLISHED
  │
  ▼
ARCHIVED
```

No se debe permitir publicar directamente una generación de IA sin revisión.

---

# 14. Interfaz de usuario

La interfaz debe ser moderna.

No se busca reproducir la experiencia visual tradicional de Moodle.

Debe transmitir:

* Institucionalidad.
* Tecnología.
* Claridad.
* Confianza.
* Modernidad.
* Simplicidad.
* Profesionalismo.

La experiencia debe sentirse como un producto institucional moderno, no como un sistema académico antiguo.

Evitar:

* Interfaces saturadas.
* Exceso de tablas.
* Formularios interminables.
* Menús con demasiados niveles.
* Uso excesivo de colores.
* Componentes visuales innecesarios.
* Apariencia genérica de dashboard administrativo.

Priorizar:

* Jerarquía visual clara.
* Espacios adecuados.
* Tarjetas cuando aporten valor.
* Navegación contextual.
* Edición inline cuando sea conveniente.
* Estados visuales claros.
* Feedback inmediato.
* Diseño responsive.
* Accesibilidad.

---

# 15. Identidad visual

Antes de implementar el diseño definitivo se debe investigar la identidad visual oficial de ASFI.

No inventar una paleta institucional.

No reemplazar el logotipo oficial por un logotipo generado artificialmente.

No modificar el logotipo institucional.

La plataforma debe utilizar los recursos institucionales correspondientes y respetar sus restricciones de uso.

Debe considerarse además el Manual de Identidad de Imagen Gobierno aplicable a instituciones públicas.

La referencia oficial de ASFI deberá utilizarse para validar:

* Logotipo.
* Tipografía.
* Colores.
* Tratamiento de marca.
* Uso sobre fondos.
* Espaciado.
* Elementos gráficos.

El diseño debe buscar una interpretación digital moderna de la identidad, no simplemente colocar el logo sobre un dashboard genérico.

---

# 16. Stack tecnológico

La aplicación deberá desarrollarse inicialmente utilizando:

## Backend

**NestJS + TypeScript**

Se debe utilizar una arquitectura modular.

Módulos conceptuales iniciales:

```text
src/
├── auth/
├── users/
├── courses/
├── course-templates/
├── course-generation/
├── notebooks/
├── sources/
├── ai/
└── common/
```

La estructura definitiva deberá establecerse mediante las Specs.

---

## Frontend

El frontend deberá utilizar el ecosistema **NestJS + frontend web moderno**, manteniendo una arquitectura separada del backend.

La tecnología concreta del frontend deberá definirse durante la fase de arquitectura, priorizando:

* TypeScript.
* Componentización.
* Accesibilidad.
* Rendimiento.
* Diseño responsive.
* Mantenibilidad.
* Integración limpia con la API NestJS.

Si se utiliza Angular, Vue, React u otra tecnología, deberá justificarse en la arquitectura y no seleccionarse únicamente por preferencia personal.

---

# 17. Base de datos

Se recomienda PostgreSQL.

Las entidades conceptuales iniciales son:

```text
User
Course
CourseTemplate
CourseTemplateSection
CourseModule
Lesson
CourseNotebook
CourseGeneration
CourseGenerationVersion
```

Las relaciones exactas deberán definirse mediante las Specs.

No crear tablas innecesarias antes de establecer los requisitos funcionales.

---

# 18. Arquitectura general

La arquitectura inicial deberá seguir aproximadamente:

```text
                CAMPUS ASFI
                     │
             ┌───────┴───────┐
             │               │
          Frontend        Backend
                           NestJS
                              │
          ┌───────────────────┼──────────────────┐
          │                   │                  │
       Courses            AI Module        Notebook Module
          │                   │                  │
          │                   │                  │
          └──────────┬────────┴──────────────────┘
                     │
                  PostgreSQL
                     │
                     │
             Google Cloud / AI
                     │
          ┌──────────┴──────────┐
          │                     │
       Gemini API       NotebookLM Enterprise
```

El backend debe ser el punto de control de la aplicación.

El frontend no debe comunicarse directamente con las APIs sensibles de Google.

---

# 19. Seguridad

Las credenciales y secretos de Google no deben almacenarse en el frontend.

Las operaciones con NotebookLM Enterprise y proveedores de IA deben realizarse desde el backend.

Nunca exponer:

* API keys.
* Service account credentials.
* OAuth client secrets.
* Tokens privados.
* Identificadores sensibles.

El sistema debe aplicar autorización sobre:

* Creación de cursos.
* Edición.
* Generación.
* Vinculación de fuentes.
* Publicación.
* Administración de notebooks.

---

# 20. Auditoría

Aunque el primer MVP sea pequeño, debe considerarse desde el inicio la trazabilidad.

Registrar como mínimo:

```text
Quién
Qué operación
Sobre qué recurso
Cuándo
Resultado
```

Ejemplo:

```text
Usuario: docente123
Operación: GENERATE_COURSE
Curso: 25
Notebook: abc123
Fecha: 2026-09-27
Resultado: SUCCESS
```

---

# 21. Principios de implementación

Aplicar los siguientes principios:

### 1. IA asistente, no autoridad

La IA propone.

El usuario decide.

### 2. Fuentes institucionales como base

La generación debe estar respaldada por las fuentes asociadas.

### 3. Estructura institucional fija

La IA rellena la estructura.

No inventa la estructura institucional.

### 4. Backend como autoridad

Las reglas de negocio, permisos, integraciones y seguridad deben estar en backend.

### 5. Proveedor de IA desacoplado

No acoplar todo el dominio a Gemini o NotebookLM.

### 6. Preparar el futuro sin construirlo ahora

La arquitectura debe permitir incorporar posteriormente:

* Tutor IA.
* RAG.
* Material personalizado.
* Audio.
* Video.
* Mapas mentales.
* Infografías.
* Evaluaciones inteligentes.
* Analítica de aprendizaje.

Pero ninguna de esas funcionalidades debe formar parte del primer MVP salvo que una Spec posterior las incluya explícitamente.

---

# 22. SDD — Spec Driven Development

Este documento constituye el contexto inicial del proyecto.

NO comenzar inmediatamente a escribir todo el código.

Primero se debe convertir este contexto en Specs.

El proceso esperado será:

```text
CONTEXT
   │
   ▼
DOMAIN ANALYSIS
   │
   ▼
REQUIREMENTS
   │
   ▼
SPECS
   │
   ▼
ARCHITECTURE
   │
   ▼
IMPLEMENTATION PLAN
   │
   ▼
IMPLEMENTATION
   │
   ▼
TESTING
   │
   ▼
REVIEW
```

Las Specs deben ser pequeñas, verificables y trazables.

No crear una única Spec gigantesca.

Separar, como mínimo, las siguientes áreas:

```text
01 — Project Foundation
02 — Authentication and Authorization
03 — Course Templates
04 — Course Creation
05 — Notebook Integration
06 — AI Course Generation
07 — Course Review
08 — Course Editing
09 — Course Publication
10 — Audit
11 — UI/UX Design System
12 — Testing
```

El orden definitivo deberá determinarse después del análisis de dependencias.

---

# 23. Primera fase de análisis

Antes de crear las Specs definitivas:

1. Analizar el dominio.
2. Identificar actores.
3. Identificar casos de uso.
4. Identificar entidades.
5. Identificar reglas de negocio.
6. Identificar integraciones externas.
7. Identificar riesgos técnicos.
8. Identificar dependencias.
9. Definir límites del MVP.
10. Proponer la estructura de Specs.

No comenzar la implementación hasta que el conjunto inicial de Specs esté suficientemente definido.

---

# 24. Actores iniciales

Para este MVP considerar inicialmente:

### Administrador

Responsable de:

* Configuración institucional.
* Plantillas.
* Fuentes.
* Integraciones.
* Notebooks.

### Docente

Responsable de:

* Crear cursos.
* Asociar Notebook.
* Generar propuesta.
* Revisar.
* Editar.
* Aprobar.
* Publicar.

### Estudiante

El estudiante existirá como parte del dominio general del Campus, pero **no tendrá funcionalidades relevantes dentro del primer MVP de creación de cursos**.

---

# 25. Fuera del alcance inicial

No implementar todavía:

```text
Student AI Tutor
RAG
Vector Database
Embeddings
Chat
Gamification
Certificates
Leaderboards
Personalized Learning
AI Agents
Advanced Analytics
AI-generated Video Platform
AI-generated Audio Platform
Advanced Assessments
Social Learning
Forums
Messaging
```

Estas funcionalidades podrán incorporarse posteriormente mediante nuevas Specs.

---

# 26. Criterio de éxito del MVP

El MVP será considerado funcional cuando un docente pueda realizar el siguiente flujo completo:

```text
Iniciar sesión
      ↓
Crear curso
      ↓
Seleccionar plantilla institucional
      ↓
Vincular Notebook
      ↓
Solicitar generación
      ↓
IA analiza las fuentes
      ↓
IA genera propuesta
      ↓
Sistema valida respuesta
      ↓
Docente revisa
      ↓
Docente edita
      ↓
Docente aprueba
      ↓
Publicar curso
```

El resultado debe ser un curso estructurado, editable y listo para ser consumido posteriormente por el módulo de estudiantes.

---

# 27. Regla final para el desarrollo

No convertir este proyecto en una simple demostración de IA.

El objetivo es construir un producto institucional real.

La IA es una capacidad del Campus ASFI, no el producto completo.

El producto es:

**Campus ASFI — una plataforma moderna de formación institucional asistida por inteligencia artificial.**

Toda decisión técnica debe priorizar:

* mantenibilidad;
* seguridad;
* trazabilidad;
* experiencia de usuario;
* arquitectura limpia;
* independencia razonable de proveedores;
* cumplimiento institucional;
* escalabilidad;
* facilidad de evolución.

No utilizar emojis en documentación, código, interfaces, mensajes del sistema ni Specs, salvo que una especificación posterior los solicite explícitamente.

El resultado visual y técnico debe sentirse como un producto de software profesional desarrollado para una institución financiera pública, no como una plantilla genérica generada automáticamente.
