# Microlearning Center
Interactive microlearning hub that transforms selected YouTube videos into focused learning paths with automated clips, actionable summaries, reusable prompts, priority routes, and progress tracking.

## Propósito y versión 1.2

Convertir videos seleccionados de YouTube en recorridos de microaprendizaje. Esta versión contiene un material con 15 fragmentos relevantes del video S6up3AnyARo.

- Recorrido completo: **58:16**.
- Recorrido prioritario: lecciones **1, 7, 10, 12 y 14**, con duración de **17:19**.
- Transiciones en pausa: Anterior, Siguiente, el mapa y los cambios de recorrido preparan el intervalo sin reproducción automática. Se comienza exclusivamente con Play dentro de YouTube; la información permanece en el panel lateral.
- Siguiente permite omitir una microlección sin completarla. Al terminar la última, el mensaje de estado muestra un resumen del recorrido.
- El fondo del rango temporal lateral se llena con el progreso del intervalo. El texto conserva su tamaño y contraste; no hay porcentaje ni contador adicional visible. El valor accesible se actualiza sin una región de anuncios continuos.
- Tooltips de navegación disponibles con ratón y foco de teclado; Escape los oculta.
- Favoritas mediante el corazón de «Qué debes retener», independientes de las completadas y persistentes por ID de microlección.
- Velocidad ajustable y persistente.
- Resúmenes, aprendizajes clave, prompts reutilizables y seguimiento del progreso mediante almacenamiento local.

Actualmente el primer material está definido dentro de app.js. En una fase posterior, videos, intervalos y lecciones se convertirán en datos configurables para admitir múltiples materiales.

## Ejecución local

1. Instala Python 3 si no lo tienes.
2. Abre una terminal en esta carpeta y ejecuta: `python -m http.server 8000`.
3. Visita http://localhost:8000 y pulsa **Play en el reproductor de YouTube**.

El video requiere conexión a Internet y acceso a YouTube. El progreso se guarda por navegador y origen; no se sincroniza entre dispositivos. Si el navegador bloquea el almacenamiento, la aplicación funciona sin conservar el progreso al recargar.

## Publicación

GitHub Pages publica desde main, carpeta / (root). La aplicación utiliza index.html, styles.css, app.js y .nojekyll, sin compilación ni backend.

La carpeta local context contiene las fuentes de preparación y está excluida mediante .gitignore; no forma parte de la publicación.

## Reproducción, progreso y accesibilidad

Al terminar un intervalo se añade únicamente esa lección al progreso persistente. Las lecciones ya completadas se identifican en el mapa y en la casilla manual; al volver a prepararlas, el fondo del rango temporal comienza vacío. Se conserva la opción de marcar o desmarcar manualmente una lección. El resumen cuenta las completadas del recorrido seleccionado, incluidas las de sesiones anteriores.

El reproductor nativo muestra los estados de reproducción y pausa. El mensaje compacto avisa de la preparación de un nuevo intervalo y del final del recorrido. La navegación no marca como completado el intervalo omitido. El progreso utiliza exclusivamente el tiempo interno del video: no hay cronómetro de pared ni detección de anuncios.

## Subtítulos y fuente

Se solicitan controles nativos y subtítulos inicialmente en español mediante controls: 1, cc_load_policy: 1, cc_lang_pref: es y hl: es. Las pistas disponibles y la preferencia final dependen de YouTube y del video original. La API pública documenta fontSize y reload para el módulo captions, pero no un selector fiable de pistas ni controles propios para activar u ocultar subtítulos; se utilizan CC y Configuración del reproductor.

- [Parámetros oficiales de YouTube](https://developers.google.com/youtube/player_parameters)
- [API oficial del reproductor](https://developers.google.com/youtube/iframe_api_reference#onApiChange)

Fuente verificada mediante oEmbed de YouTube el 10 de septiembre de 2026: **🚀 CLASE 1: Conviértete en el 1% Capaz de Comunicarse Correctamente con la IA**, del canal **CenteIA Education** ([canal](https://www.youtube.com/@centeia-education), [video](https://www.youtube.com/watch?v=S6up3AnyARo)). Todas las microlecciones proceden de ese video. La atribución permanece en la información de cada lección. Los enlaces externos de la aplicación muestran un diálogo accesible antes de abrir YouTube en otra pestaña; la aplicación no realiza suscripciones.

## Preferencias locales

Las favoritas usan ia58-favorites-v1 y un conjunto de identificadores estables; la velocidad usa ia58-speed-v1. El progreso mantiene la clave original ia58-progress-v1. Reiniciar progreso no elimina favoritas ni velocidad. No hay cuenta, sincronización, analítica ni recorrido de favoritas. Si el almacenamiento está bloqueado, las preferencias funcionan durante la sesión y se muestra una explicación; los datos corruptos se descartan.

## Validación de la versión 1.2

Pruebas en navegador con eventos simulados y regresiones de las versiones anteriores adaptadas a Play nativo: 15 intervalos completos, preparación sin reproducción automática, navegación y ambas rutas, omisión, progreso integrado en 0/50/100 y límites, pausa/carga sin avance artificial, persistencia y recuperación de almacenamiento corrupto o bloqueado, favoritas independientes, velocidad, tooltips (hover, foco y Escape), subtítulos, atribución y diálogo externo.

Los datos editoriales y rangos se compararon íntegramente con la versión anterior. Se revisaron anchos de 320, 390, 768, 1024 y 1440 px, encabezados y tooltips largos, y contraste del rango vacío, medio y lleno. Con el reproductor real se comprobó Play nativo, finalización de la primera microlección, preparación pausada de la segunda y su inicio mediante Play nativo. Los scripts y capturas están en context y no se publican.
