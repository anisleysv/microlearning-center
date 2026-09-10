# Microlearning Center
Interactive microlearning hub that transforms selected YouTube videos into focused learning paths with automated clips, actionable summaries, reusable prompts, priority routes, and progress tracking.

## Propósito y versión 1.1

Convertir videos seleccionados de YouTube en recorridos de microaprendizaje. Esta versión contiene un material con 15 fragmentos relevantes del video S6up3AnyARo.

- Recorrido completo: **58:16**.
- Recorrido prioritario: lecciones **1, 7, 10, 12 y 14**, con duración de **17:19**.
- Transiciones en pausa: cada microlección presenta número, título, resumen y duración antes de reproducirse. Anterior, Siguiente, el mapa y los cambios de recorrido preparan el intervalo sin reproducción automática.
- Reproducir comienza desde el inicio del intervalo; Saltar no añade la lección al progreso. Al terminar o saltar la última, aparece un resumen del recorrido.
- Progreso del intervalo con tiempo, porcentaje y barra accesible, calculado exclusivamente con el tiempo interno del video; velocidad ajustable.
- Resúmenes, aprendizajes clave, prompts reutilizables y seguimiento del progreso mediante almacenamiento local.

Actualmente el primer material está definido dentro de app.js. En una fase posterior, videos, intervalos y lecciones se convertirán en datos configurables para admitir múltiples materiales.

## Ejecución local

1. Instala Python 3 si no lo tienes.
2. Abre una terminal en esta carpeta y ejecuta: `python -m http.server 8000`.
3. Visita http://localhost:8000 y pulsa **Reproducir microlección**.

El video requiere conexión a Internet y acceso a YouTube. El progreso se guarda por navegador y origen; no se sincroniza entre dispositivos. Si el navegador bloquea el almacenamiento, la aplicación funciona sin conservar el progreso al recargar.

## Publicación

GitHub Pages publica desde main, carpeta / (root). La aplicación utiliza index.html, styles.css, app.js y .nojekyll, sin compilación ni backend.

La carpeta local context contiene las fuentes de preparación y está excluida mediante .gitignore; no forma parte de la publicación.

## Reproducción, progreso y accesibilidad

Al terminar un intervalo se añade únicamente esa lección al progreso persistente. Las lecciones ya completadas se identifican en el mapa y junto al indicador; al volver a prepararlas, la barra del nuevo intento comienza en 0 %. Se conserva la opción de marcar o desmarcar manualmente una lección. El resumen cuenta las completadas del recorrido seleccionado, incluidas las de sesiones anteriores.

Los estados preparada, reproduciéndose, pausada y completada se muestran con texto y color. Omitida se anuncia durante la transición o en el resumen final; no se guarda como un nuevo estado persistente. Los tiempos no se calculan con un cronómetro de pared ni se intenta detectar anuncios.

## Subtítulos y fuente

Se solicitan controles nativos y subtítulos inicialmente en español mediante controls: 1, cc_load_policy: 1, cc_lang_pref: es y hl: es. Las pistas disponibles y la preferencia final dependen de YouTube y del video original. La API pública documenta fontSize y reload para el módulo captions, pero no un selector fiable de pistas ni controles propios para activar u ocultar subtítulos; se utilizan CC y Configuración del reproductor.

- [Parámetros oficiales de YouTube](https://developers.google.com/youtube/player_parameters)
- [API oficial del reproductor](https://developers.google.com/youtube/iframe_api_reference#onApiChange)

Fuente verificada mediante oEmbed de YouTube el 10 de septiembre de 2026: **🚀 CLASE 1: Conviértete en el 1% Capaz de Comunicarse Correctamente con la IA**, del canal **CenteIA Education** ([canal](https://www.youtube.com/@centeia-education), [video](https://www.youtube.com/watch?v=S6up3AnyARo)). Todas las microlecciones proceden de ese video. La atribución permanece en la información de cada lección. Los enlaces externos de la aplicación muestran un diálogo accesible antes de abrir YouTube en otra pestaña; la aplicación no realiza suscripciones.

## Validación de la versión 1.1

Pruebas de navegador con eventos simulados: preparación inicial, finalización de los 15 intervalos sin reproducción automática, omisión, navegación, ambas rutas, contador y límites 0–100 %, progreso tras recarga y datos corruptos, eventos tardíos, preferencias de subtítulos, atribución, diálogo (cancelación, Escape, continuación y foco), y anchos 320, 390, 768 y 1440 px. Los datos de las 15 lecciones se compararon íntegramente con la versión anterior. El reproductor real se comprobó por separado. Las evidencias locales permanecen en context y no se publican.
