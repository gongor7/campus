# SPEC — ui

Estado: BORRADOR — pendiente de revisión.
Módulo: ui (docs/capability-map.md). Referencia visual: design/mockup.html.

## Objetivo

Interfaz institucional moderna: jerarquía clara, espacios amplios, estados visuales evidentes, feedback inmediato, responsive y accesible. Sensación de producto institucional actual, no de dashboard administrativo genérico (PROMPT-MAESTRO sección 14). Sin emojis en ningún texto de interfaz.

## Identidad visual (investigada, no inventada)

Fuentes de la investigación (2026-09-27):
- Logo oficial: asfi.gob.bo/sites/default/files/2025-07/asfi.png (copia local: design/assets/asfi-logo.png).
- Colores extraídos del logo: turquesa barras #2EC4B6, azul petróleo corchetes #1F6E8C, fondo del isotipo negro.
- Color primario del tema CSS institucional: #175776 (azul petróleo). Acento rojo puntual del sitio: #E5252A.

Paleta del sistema:

| Token | Valor | Uso |
|---|---|---|
| primary | #175776 | Cabecera, acciones principales, enlaces activos |
| primary-deep | #1F6E8C | Elementos secundarios del primario, hovers |
| accent | #2EC4B6 | Realces, indicadores de progreso, selección |
| ink | #10201F | Texto principal |
| muted | #5A6B72 | Texto secundario |
| bg | #F4F7F8 | Fondo de página |
| surface | #FFFFFF | Tarjetas y paneles |
| line | #D9E2E6 | Bordes y separadores |
| success / warning / danger | #1E8E5A / #B7791F / #C0392B | Estados (chips, alertas) |

Tipografía: Inter (Google Fonts) con pila de respaldo del sistema. Escala: 14 (base), 16, 20, 24, 32.
Iconografía: Bootstrap Icons (la misma que usa el portal ASFI); nunca emojis.
Radios: 10-14 px. Sombras suaves de baja difusión. Densidad aireada.

## Vistas del MVP

1. Cursos — listado con tarjetas: título, nivel, duración, público, chip de estado (Borrador, En revisión, Publicado, Archivado), progreso de lecciones con contenido.
2. Nuevo curso — asistente de 3 pasos: (1) datos generales (6 campos), (2) cuaderno de fuentes (elegir existente o crear y subir archivos), (3) estructura propuesta por IA con brechas de cobertura.
3. Editor de curso — dos paneles: árbol de estructura (módulos/lecciones/secciones) y editor de lección (objetivo, contenido, citas de fuente, regenerar lección). Barra de estado con acciones: enviar a revisión, aprobar, publicar, archivar.
4. Cuadernos de fuentes — listado de cuadernos con sus documentos, tamaño y fecha; subir y eliminar fuentes.
5. Auditoría — listado cronológico filtrable por recurso (uso administrativo).
6. Barra superior común: logo institucional, nombre Campus ASFI, navegación (Cursos, Cuadernos, Auditoría).

## Reglas de interfaz

- Español en todos los textos; sin emojis; mensajes de estado claros y accionables.
- Toda acción destructiva o de estado pide confirmación inline.
- Estados de carga y error visibles por pantalla (esqueletos o mensajes, nunca la interfaz congelada).
- Accesibilidad: contraste AA, foco visible, navegación por teclado, labels en todos los campos.
- Responsive: adaptado a escritorio y tableta; el MVP no optimiza móvil.

## Success Criteria

1. El flujo completo (crear curso → subir/cuaderno → generar estructura → editar → publicar) se realiza sin salir de las vistas listadas.
2. La paleta y el logo aplicados corresponden a los tokens de esta spec (verificable contra design/mockup.html).
3. Ningún texto de interfaz contiene emojis.
