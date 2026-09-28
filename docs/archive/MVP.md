# MVP — Campus ASFI Inteligente

## 1. Propósito

El MVP tiene como propósito validar el concepto de un **entorno de aprendizaje interactivo para Campus ASFI**, orientado a que el usuario no solo consulte información, sino que pueda enfrentarse a situaciones contextualizadas, analizar información, tomar decisiones y recibir retroalimentación sobre su desempeño.

El MVP busca validar principalmente la experiencia y el flujo de aprendizaje antes de incorporar capacidades avanzadas de inteligencia artificial.

---

## 2. Problema que aborda

Un modelo tradicional de capacitación puede centrarse principalmente en:

* lectura de material;
* consulta de documentos;
* cuestionarios;
* preguntas con respuestas predeterminadas.

El MVP propone explorar una experiencia diferente:

> **El usuario aprende enfrentándose a una situación y tomando decisiones dentro de ella.**

La plataforma debe permitir pasar de un modelo de **consumo de información** a uno de **aprendizaje mediante interacción y toma de decisiones**.

---

## 3. Objetivo del MVP

Construir una primera experiencia funcional que permita demostrar el siguiente ciclo:

```text
CONTEXTO
   ↓
SITUACIÓN
   ↓
ANÁLISIS
   ↓
DECISIÓN
   ↓
CONSECUENCIA
   ↓
RETROALIMENTACIÓN
   ↓
NUEVO ESCENARIO
```

El MVP no pretende construir todavía el Campus ASFI completo ni resolver todas las capacidades de aprendizaje adaptativo.

Su objetivo es demostrar que este ciclo puede convertirse en una experiencia de capacitación viable.

---

# 4. ¿Qué se construirá?

Se construirá un **simulador interactivo de aprendizaje**.

El usuario ingresará a una simulación y recibirá un escenario relacionado con una situación de supervisión.

El escenario proporcionará información suficiente para que el usuario pueda analizar la situación y seleccionar una acción.

La plataforma procesará la decisión y mostrará:

* resultado de la decisión;
* retroalimentación;
* consecuencia;
* siguiente escenario.

El usuario continuará tomando decisiones hasta completar la simulación.

Al finalizar, el sistema mostrará un resumen de su desempeño.

---

# 5. Ejemplo conceptual

### Situación

Una entidad presenta un crecimiento importante de su cartera de créditos mientras simultáneamente aumenta el indicador de mora.

El usuario recibe información contextual y debe decidir:

> ¿Qué información debería analizar primero?

El usuario selecciona una alternativa.

El sistema no se limita a mostrar:

> "Correcto."

En cambio, debe explicar brevemente el resultado y llevar la simulación hacia el siguiente punto de análisis.

Por ejemplo:

```text
DECISIÓN
   ↓
RESULTADO
   ↓
RETROALIMENTACIÓN
   ↓
NUEVA INFORMACIÓN
   ↓
NUEVA DECISIÓN
```

Este comportamiento constituye el núcleo del MVP.

---

# 6. Alcance funcional

El MVP incluirá:

### 6.1 Simulaciones

* visualizar una simulación disponible;
* consultar su objetivo y descripción;
* iniciar una simulación.

### 6.2 Escenarios

Cada simulación estará compuesta por escenarios.

Cada escenario podrá contener:

* contexto;
* información relevante;
* pregunta o situación;
* alternativas de decisión.

### 6.3 Decisiones

El usuario podrá seleccionar una decisión.

Cada decisión tendrá asociada una consecuencia definida por el sistema.

### 6.4 Retroalimentación

Después de cada decisión, el sistema mostrará información que permita comprender el resultado.

### 6.5 Navegación adaptativa básica

La decisión del usuario podrá determinar qué escenario se presenta posteriormente.

Por tanto, la simulación podrá representar diferentes caminos.

```text
                  ESCENARIO 1
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Decisión A   Decisión B   Decisión C
          │            │            │
          ▼            ▼            ▼
      Escenario 2A  Escenario 2B  Escenario 2C
```

### 6.6 Resultado

Al completar la simulación se mostrará un resumen del desempeño del usuario.

---

# 7. Qué NO forma parte del MVP

Para mantener el MVP pequeño y verificable, quedan fuera de esta primera etapa:

* LLM;
* chatbot general;
* RAG;
* generación automática de contenido;
* embeddings;
* búsqueda semántica;
* evaluación mediante inteligencia artificial;
* generación automática de escenarios;
* adaptación avanzada del contenido mediante IA;
* perfiles de conocimiento avanzados;
* recomendaciones personalizadas mediante IA;
* panel administrativo completo;
* aplicación móvil;
* gamificación avanzada;
* rankings;
* certificados;
* integraciones externas.

Estas capacidades podrán evaluarse en fases posteriores.

---

# 8. Inteligencia artificial

La inteligencia artificial **no es un requisito para validar el MVP**.

La primera versión utilizará reglas definidas para:

* evaluar decisiones;
* determinar consecuencias;
* seleccionar el siguiente escenario;
* calcular resultados.

Esto permite validar primero la experiencia sin introducir costos de infraestructura de IA.

Posteriormente, la arquitectura podrá incorporar IA para:

```text
Respuesta libre
      ↓
LLM
      ↓
Análisis del razonamiento
      ↓
Retroalimentación
      ↓
Identificación de brechas
```

La IA será una evolución del producto, no una dependencia para demostrar el concepto inicial.

---

# 9. Alcance técnico

La primera implementación contempla:

```text
Frontend
Vue

Backend
NestJS

Persistencia
PostgreSQL

Ejecución
Docker
```

La arquitectura deberá mantener separadas:

* interfaz;
* lógica de negocio;
* persistencia;
* evaluación de decisiones.

Esto permitirá evolucionar posteriormente el motor de evaluación sin reconstruir la aplicación.

---

# 10. Flujo completo del MVP

```text
                 INICIO
                    │
                    ▼
          Seleccionar simulación
                    │
                    ▼
            Iniciar simulación
                    │
                    ▼
             Presentar escenario
                    │
                    ▼
          Presentar información
                    │
                    ▼
             Tomar decisión
                    │
                    ▼
           Evaluar decisión
                    │
                    ▼
        Mostrar retroalimentación
                    │
                    ▼
          Determinar consecuencia
                    │
                    ▼
           Siguiente escenario
                    │
              ┌─────┴─────┐
              │           │
           ¿Final?       No
              │           │
             Sí           └──────► nuevo escenario
              │
              ▼
       Resultado final
```

---

# 11. Primera simulación

Para el MVP se implementará **una simulación completa**, suficientemente representativa para demostrar el concepto.

El caso inicial estará relacionado con el análisis de una situación de supervisión y deberá contener varios escenarios encadenados.

La simulación debe ser lo suficientemente completa para que una persona pueda realizarla de principio a fin y experimentar:

* contexto;
* análisis;
* decisión;
* consecuencia;
* retroalimentación;
* progresión;
* resultado.

El contenido específico y sus reglas deberán definirse posteriormente durante la fase de especificación.

---

# 12. Resultado esperado

Al finalizar el MVP deberá existir una experiencia demostrable en la que una persona pueda:

1. ingresar al módulo;
2. seleccionar la simulación;
3. iniciar un caso;
4. analizar un escenario;
5. tomar una decisión;
6. recibir retroalimentación;
7. avanzar a otro escenario;
8. tomar nuevas decisiones;
9. completar la simulación;
10. visualizar su resultado.

---

# 13. Criterio de éxito del MVP

El MVP será considerado exitoso si permite demostrar de manera clara el concepto:

> **Aprender mediante la resolución de situaciones y toma de decisiones, en lugar de limitarse al consumo de contenido o a un cuestionario tradicional.**

No se medirá el éxito del MVP por la cantidad de funcionalidades implementadas, sino por la capacidad de demostrar este flujo de aprendizaje de principio a fin.

---

# 14. Evolución prevista

El MVP constituye la primera etapa de una evolución mayor.

### MVP

```text
Simulación
+
Reglas
+
Decisiones
+
Feedback
```

### Evolución 1

```text
Simulación
+
Contenido oficial
+
RAG
```

### Evolución 2

```text
RAG
+
LLM
+
Respuestas abiertas
```

### Evolución 3

```text
Perfil del usuario
+
Historial
+
Brechas de conocimiento
+
Adaptación
```

### Visión

```text
             CAMPUS ASFI
                  │
                  ▼
        ┌───────────────────┐
        │ Motor de          │
        │ aprendizaje       │
        └─────────┬─────────┘
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
   Contenido  Simulación    Tutor
       │          │          │
       └──────────┼──────────┘
                  ▼
          Perfil de aprendizaje
                  │
                  ▼
        Experiencia adaptativa
```

El MVP **no implementa todavía esta visión completa**. Su función es validar el núcleo sobre el cual podrá construirse posteriormente.

---

# 15. Límite explícito del MVP

La frontera de esta primera versión es:

> **Un usuario puede completar una simulación interactiva basada en escenarios, tomar decisiones y recibir consecuencias y retroalimentación, utilizando lógica determinística y sin depender de un LLM.**

Todo aquello que no sea necesario para demostrar ese flujo deberá considerarse fuera del MVP.

---

# 16. Siguiente fase

Una vez aprobado este documento:

```text
MVP
 ↓
Constitución
 ↓
Entrevista de especificación
 ↓
SPEC
 ↓
QA / Clarificación
 ↓
Plan
 ↓
Tareas
 ↓
Implementación
 ↓
Validación
```

La implementación no deberá comenzar antes de completar las fases de **constitución y especificación** definidas por la metodología del proyecto.
