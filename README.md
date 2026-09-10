# Microlearning Center
Interactive microlearning hub that transforms selected YouTube videos into focused learning paths with automated clips, actionable summaries, reusable prompts, priority routes, and progress tracking.

## Propósito y primera versión

Convertir videos seleccionados de YouTube en recorridos de microaprendizaje. Esta primera versión contiene un material con 15 fragmentos relevantes del video S6up3AnyARo.

- Recorrido completo: **58:16**.
- Recorrido prioritario: lecciones **1, 7, 10, 12 y 14**, con duración de **17:19**.
- Saltos automáticos, botones Anterior y Siguiente y velocidad ajustable.
- Resúmenes, aprendizajes clave, prompts reutilizables y seguimiento del progreso mediante almacenamiento local.

Actualmente el primer material está definido dentro de app.js. En una fase posterior, videos, intervalos y lecciones se convertirán en datos configurables para admitir múltiples materiales.

## Ejecución local

1. Instala Python 3 si no lo tienes.
2. Abre una terminal en esta carpeta y ejecuta: `python -m http.server 8000`.
3. Visita http://localhost:8000 y pulsa **Comenzar recorrido**.

El video requiere conexión a Internet y acceso a YouTube. El progreso se guarda por navegador y origen; no se sincroniza entre dispositivos. Si el navegador bloquea el almacenamiento, la aplicación funciona sin conservar el progreso al recargar.

## Publicación

GitHub Pages publica desde main, carpeta / (root). La aplicación utiliza index.html, styles.css, app.js y .nojekyll, sin compilación ni backend.

La carpeta local context contiene las fuentes de preparación y está excluida mediante .gitignore; no forma parte de la publicación.
