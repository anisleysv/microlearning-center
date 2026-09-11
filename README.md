# Microlearning Center
Interactive microlearning hub that transforms selected YouTube videos into focused learning paths with automated clips, actionable summaries, reusable prompts, priority routes, and progress tracking.

## Propósito

Convertir videos seleccionados de YouTube en recorridos de microaprendizaje.

La aplicación carga un catálogo explícito y paquetes JSON. Añadir otro material compatible no requiere editar el contenido de `app.js`. El catálogo actual contiene únicamente el material original **IA en 58 minutos**, del video `S6up3AnyARo`:

- 15 microlecciones y **58:16** de intervalos seleccionados.
- Alta prioridad: lecciones **1, 7, 10, 12 y 14**, con **17:19**.
- Textos editoriales, aprendizajes, prompts e intervalos preservados de la versión publicada.

## Ejecución local

Se necesita un servidor HTTP; abrir `index.html` mediante `file://` no está soportado.

Desde la raíz del proyecto, con Python 3 disponible:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abre [la aplicación local](http://127.0.0.1:8000). Si Windows no encuentra `python`, usa la ruta completa de tu ejecutable Python o un servidor HTTP estático equivalente. No hacen falta módulos de Python adicionales. Detén el servidor con Ctrl+C.

YouTube requiere conexión a Internet. La aplicación funciona con HTML, CSS y JavaScript, sin compilación, backend, autenticación ni base de datos.

## Paquetes y contrato 1.0.0

```text
materials/
├── catalog.json
├── schema/
│   ├── source.schema.json
│   ├── material.schema.json
│   └── lessons.schema.json
└── youtube-S6up3AnyARo/
    ├── source.json
    ├── material.json
    └── lessons.json
```

Los tres esquemas son copias exactas de los entregados por `microlearning-app-content-packager`. No se han alterado. Son JSON Schema 2020-12; el validador compartido implementa las palabras utilizadas por estos tres esquemas y rechaza palabras nuevas no soportadas. No pretende ser un motor general de JSON Schema. Tanto el navegador como el script usan este mismo validador, sin dependencias de producción.

- Carpeta/material: `youtube-<videoId>`; fuente: `youtube:<videoId>`.
- Lección: `<materialId>-lesson-<stableSuffix>`. Los IDs nunca se renumeran al reordenar; `order` controla presentación.
- Los tres documentos comparten `schemaVersion: "1.0.0"` y `contentVersion`, entero positivo.
- `material.json` contiene el título, descripción e idioma editorial, con referencias exactas `./source.json` y `./lessons.json`.
- `source.json` contiene la identidad y atribución audiovisual.
- `lessons.json` es un objeto con `materialId` y `lessons`.
- Los intervalos son enteros `[startSeconds, endSeconds)`, cronológicos, sin solapamientos; se permiten huecos.
- La prioridad es exclusivamente `high` o `standard`. El recorrido prioritario se deriva mediante comparación explícita con `high`.
- Cantidades, duraciones y etiquetas temporales se calculan. No se guardan listas prioritarias paralelas.
- `prompt`, `steps` y `tools` son opcionales. Pasos y herramientas aparecen debajo de los aprendizajes; la plantilla tiene su pestaña cuando existe.
- Todo texto editorial se presenta mediante `textContent` y creación de elementos, sin interpretar HTML.

Las comprobaciones entre archivos validan identidades, revisiones, orden, rutas, URLs web y límites temporales. Los enlaces de video y canal deben corresponder a YouTube; no se admiten esquemas ejecutables en enlaces de herramientas o licencias. La presencia de atribución no certifica que el título o autor sean oficiales: esa comprobación pertenece al proceso editorial y QA. Si falta la duración completa del video, se informa que no se pudo comprobar ese límite superior.

## Incorporar materiales

1. Copia un paquete revisado a `materials/youtube-VIDEO_ID/`. Incluye únicamente sus tres JSON, sin transcripciones ni notas internas.
2. Ejecuta desde la raíz, con Node.js 20 o posterior:

```powershell
node scripts/materials.mjs check
node scripts/materials.mjs sync --dry-run
node scripts/materials.mjs sync --dry-run --include youtube-VIDEO_ID
node scripts/materials.mjs sync --include youtube-VIDEO_ID
```

`check` no escribe y valida catálogo y todas las carpetas de paquetes. `sync --dry-run` muestra candidatos, catálogo resultante y diferencias sin escribir. La inclusión exige IDs explícitos mediante `--include`, repetible para varios materiales. El orden existente se conserva y los nuevos IDs se añaden ordenados de forma determinista.

`sync` actualiza también las revisiones de los materiales ya incluidos. Si una revisión cambió, `check` detecta la discrepancia; revísala con `sync --dry-run`. Para aplicar solo esa actualización puedes indicar el ID existente con `--include`.

Todos los paquetes deben pasar las validaciones antes de escribir. Un error, un archivo ausente o una carpeta catalogada que desapareció deja el catálogo intacto. La escritura utiliza un archivo temporal y reemplazo final, con comprobación de que el catálogo no cambió mientras se validaba.

El catálogo contiene `schemaVersion` y entradas con `id`, `manifest`, `order`, `status: "published"` y `contentVersion`. Los metadatos editoriales permanecen en el material. Una carpeta fuera del catálogo no es privada si sus archivos se publican: conserva borradores internos fuera de `materials/`.

El script nunca hace commit, push ni despliegue. Revisa el diff y prueba la aplicación antes de autorizar la publicación.

## Carga, selección y reproducción

El tema se aplica antes de CSS. Después se cargan catálogo, manifiestos y paquete seleccionado, se recupera su estado y se prepara YouTube cuando la API y el material están listos. El selector se muestra cuando hay varios materiales; con uno se muestran solamente título y descripción.

Las cargas comprueban HTTP, JSON, esquema y relaciones. Durante una carga no se puede actuar sobre el contenido anterior; hay reintento para errores. Un catálogo vacío muestra un aviso. La selección se representa mediante `?material=...`, compatible con recargas de GitHub Pages. Si el ID no está en el catálogo, se carga el primer material disponible, se corrige la URL y se muestra un aviso no bloqueante. Los errores de red, JSON, esquema o integridad conservan su mensaje de error y no activan este fallback. Todas las rutas de datos son relativas a sus documentos.

Cambiar de material pausa y destruye el reproductor anterior. Un identificador de generación y la identidad del reproductor descartan eventos atrasados incluso al volver al mismo video. Existe un único temporizador para actualizar el progreso. Las peticiones anteriores se cancelan y sus resultados se descartan.

Anterior, Siguiente, el mapa, el cambio de recorrido y la finalización de un intervalo preparan la siguiente lección mediante `cueVideoById`, en pausa. El inicio se realiza con Play dentro de YouTube. Omitir una lección no la marca como completada. El progreso integrado usa exclusivamente tiempo interno del video; no tiempo de pared ni detección de anuncios.

Se conservan tooltips, casilla manual, «Me gusta», copia de prompts, diálogo de fuente externa y navegación de pestañas mediante flechas, Home y End. Fuente original permanece al final. Un material sin `high` muestra el recorrido prioritario deshabilitado y explica el motivo.

Subtítulos y controles siguen siendo nativos. Se solicita el idioma de `source.language`; las pistas y velocidades disponibles dependen del video y de YouTube. La fuente, autor, canal, enlaces, diálogo y pie se actualizan con el material. El nombre del canal se muestra como texto; su URL se conserva y valida en los datos. El único enlace externo del panel es «Ver video original y canal en YouTube»; tanto este enlace como el del pie abren el diálogo de confirmación.

## Persistencia y migración

Preferencias globales:

```text
microlearning-center:preferences:v2
```

Contiene `storageVersion: 2`, `theme` y `playbackSpeed`. El tema admite Sistema, Claro y Oscuro; la velocidad admite 1, 1.25, 1.5, 1.75 y 2.

Estado por material:

```text
microlearning-center:state:v2:<materialId>
```

Contiene `storageVersion: 2`, `completedLessonIds` y `likedLessonIds`. No se guardan recorrido, lección activa ni posición parcial. Cambiar `contentVersion` no modifica estas claves ni borra el progreso.

La migración utiliza un mapa explícito de los antiguos números 1–15 a IDs estables, solo para `youtube-S6up3AnyARo`. Se deduplican y validan IDs. `ia58-progress-v1` e `ia58-favorites-v1` migran a ese material; `ia58-speed-v1` e `ia58-theme-v1` migran a preferencias globales.

Un registro v2 ya existente nunca se sustituye por una nueva importación del legado. La escritura satisfactoria del registro v2 sirve como marcador de migración; las claves antiguas se conservan. Reiniciar progreso escribe una lista vacía en v2 y conserva «Me gusta», tema y velocidad, evitando reimportar completadas en la siguiente carga.

Si el almacenamiento falla, el estado sigue funcionando en memoria durante la sesión, incluso al cambiar de material. Un origen diferente tiene almacenamiento diferente: la vista local y GitHub Pages no comparten progreso. No hay sincronización entre dispositivos.

## Pruebas

```powershell
node --test tests/materials.test.mjs
```

Las pruebas de contrato y almacenamiento usan únicamente Node.js. Para las de navegador se necesita Playwright y un navegador compatible ya instalados:

```powershell
node tests/browser.cjs
```

Si Playwright está fuera de las rutas normales de Node, `PLAYWRIGHT_MODULE` puede señalar su ruta. `BROWSER_CHANNEL` selecciona el navegador; el valor predeterminado es `msedge`. No se descargan dependencias automáticamente.

Los fixtures del segundo material se sirven solo en memoria y no se añaden al catálogo. Las copias de trabajo para pruebas del validador, capturas y puntos recuperables están en `.local-review/`, ignorada. Las pruebas comprueban errores de JSON, esquemas, identidades, referencias, tiempos, catálogo, migración y aislamiento; el navegador cubre reproducción simulada, estados de carga, reintento, pestañas, temas y tamaños de 320 a 1440 px.

La regresión editorial compara las 15 lecciones con el commit publicado `a8c826966d9e11cd9e23096b5961b08aea558812`. Durante esta migración se comprobó además con YouTube real: Play del primer intervalo, finalización, preparación de la segunda lección en pausa y su inicio mediante Play nativo.

## Publicación e identidad

GitHub Pages continúa configurado desde `main`, carpeta `/ (root)`. Esta migración se mantiene local hasta revisión y autorización; no requiere cambiar Pages.

`context/`, `design/`, `skills/`, `.local-review/`, archivos ZIP y metadatos de alojamiento permanecen ignorados. Solo los tres esquemas del empaquetador se copian a `materials/schema/`. Los paquetes dentro de `materials/` sí son contenido público versionado.

El logotipo SVG actual conserva Play y el aro segmentado e incorpora el ajuste aprobado de la pieza de rompecabezas ámbar. Ya no es una copia idéntica del SVG de referencia. Esta migración no modifica el logo ni el favicon.

Inter se aloja localmente en `assets/fonts/InterVariable.woff2`, con su licencia en `assets/fonts/OFL.txt`. Se mantienen los temas y el diseño compacto aprobados.
