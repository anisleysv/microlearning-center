# Microlearning Center
Interactive microlearning hub that transforms selected YouTube videos into focused learning paths with automated clips, actionable summaries, reusable prompts, priority routes, and progress tracking.

## Propósito

Convertir videos seleccionados de YouTube en recorridos de microaprendizaje.

La aplicación carga un catálogo explícito y paquetes JSON. Añadir otro material compatible no requiere editar el contenido de `app.js`. El catálogo local contiene cuatro materiales con contenido aprobado. Los cuatro materiales cuentan con contenido y clasificación editorial aprobados. El original **IA en 58 minutos**, del video `S6up3AnyARo`, conserva:

- 15 microlecciones y **58:16** de intervalos seleccionados.
- Alta prioridad: lecciones **1, 7, 10, 12 y 14**, con **17:19**.
- Textos editoriales, aprendizajes, prompts e intervalos preservados de la versión publicada.

El segundo material, **Agentes, imágenes y vídeos profesionales con IA** (`6h6306mA3bQ`), contiene 30 microlecciones: **01:21:24** seleccionados y **30:50** prioritarios (lecciones 2, 3, 5, 6, 7, 11, 17, 19, 20, 24, 26 y 27). Sus tres JSON se incorporan sin cambios desde el paquete aprobado, incluida la salvaguarda de la microlección 29.

La biblioteca incluye también:

- **Herramientas y automatizaciones con IA: un sistema práctico de trabajo** (`2BoTWGq0vjY`): 34 microlecciones, **01:12:20** completos y **33:15** prioritarios (3, 4, 5, 8, 11, 13, 17, 18, 19, 28 y 31).
- **Hoja de ruta para desarrollar competencias aplicadas en IA** (`V60Xr0jbthE`): 10 microlecciones, **06:57** completos y **04:15** prioritarios (1, 2, 5, 8 y 10).

Ambos conservan exactamente los tres JSON aprobados y `editorialStatus: "approved"` en el índice. La publicación de materiales nuevos requiere aprobación técnica, editorial y visual explícita.

## Desarrollo y compilación con Vite

El proyecto conserva JavaScript nativo y usa Vite únicamente para desarrollo y compilación. Sigue siendo una sola aplicación estática: no incorpora backend, SSR, autenticación ni base de datos. Abrir `index.html` mediante `file://` no está soportado.

Instala las dependencias una vez y ejecuta el servidor de desarrollo:

```powershell
npm install
npm run dev
```

Abre la URL que Vite muestra en la terminal. Para crear el artefacto de producción ejecuta `npm run build`; Vite genera `dist/`. DigitalOcean debe usar `npm ci && npm run build` como comando de compilación y `dist` como directorio de salida. Es una Static Site y no consume recursos de backend de DigitalOcean.

YouTube requiere conexión a Internet. La aplicación usa HTML, CSS y JavaScript nativo; Vite solo compila el artefacto estático. No incorpora backend, autenticación ni base de datos.

## Paquetes y contrato 1.0.0

```text
public/materials/
├── catalog.json
├── library.json
├── schema/
│   ├── source.schema.json
│   ├── material.schema.json
│   └── lessons.schema.json
├── youtube-S6up3AnyARo/
│   ├── source.json
│   ├── material.json
│   └── lessons.json
├── youtube-6h6306mA3bQ/
│   ├── source.json
│   ├── material.json
│   └── lessons.json
├── youtube-2BoTWGq0vjY/
│   ├── source.json
│   ├── material.json
│   └── lessons.json
└── youtube-V60Xr0jbthE/
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

1. Solo después de aprobar contenido, QA y clasificación editorial, copia el paquete a `public/materials/youtube-VIDEO_ID/`. Incluye únicamente sus tres JSON, sin transcripciones ni notas internas.
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

El catálogo contiene `schemaVersion` y entradas con `id`, `manifest`, `order`, `status: "published"` y `contentVersion`. Los metadatos editoriales permanecen en el material. Un material pendiente debe permanecer fuera del árbol público, por ejemplo en `context/incoming/`. Solo después de aprobar su contenido, QA y clasificación editorial se copia a `public/materials/` y se incorpora a `catalog.json`. En un hosting estático, excluir un material del catálogo no impide el acceso directo a sus archivos si ya están incluidos en el repositorio publicado. `library.json` es un índice editorial: no es un mecanismo de seguridad ni de control de acceso.

El script nunca hace commit, push ni despliegue. Revisa el diff y prueba la aplicación antes de autorizar la publicación.

## Carga, selección y reproducción

El tema se aplica antes de CSS. Se cargan y validan los paquetes publicados para buscar por material, título oficial, canal y microlección. La biblioteca izquierda tiene 280 px y puede contraerse; en pantallas menores de 1280 px se abre como un diálogo lateral con foco contenido, cierre con Escape y devolución del foco. En escritorio se abre inicialmente desde 1440 px.

Los filtros de idioma, temática, estado y Me gusta se combinan entre sí. El estado se deriva de las lecciones completadas: ninguna, algunas o todas; escuchar sin completar no marca un material como iniciado. Los resultados de microlecciones permiten abrirlas directamente. La carga inicial es completa, adecuada al catálogo actual de cuatro materiales: un paquete inválido conserva su error visible. Para un catálogo grande habrá que evaluar un índice de búsqueda y carga diferida.

`public/materials/library.json` es un índice opcional independiente (`indexVersion: 1`) con temáticas normalizadas, etiquetas y estado editorial. Su ausencia (HTTP 404) permite cargar paquetes 1.0.0 sin filtros temáticos; otros errores siguen visibles. Las temáticas de los cuatro materiales cuentan con aprobación humana y están marcadas con `editorialStatus: "approved"`. La Lección 3 incluye «Automatización de flujos con IA». La Lección 4 no incluye Ética/gobernanza como temática principal. `tags` permanece como una lista vacía hasta definir vocabulario controlado, granularidad y política editorial; no se inventan ni infieren etiquetas. No se infieren desde los títulos. Idioma y autor proceden del paquete; cantidades y duraciones se calculan. Los esquemas y el formato del catálogo 1.0.0 permanecen intactos. `check` valida también este índice; `sync` no lo reescribe.

Las cargas comprueban HTTP, JSON, esquema y relaciones. Durante una carga no se puede actuar sobre el contenido anterior; hay reintento para errores. Un catálogo vacío muestra un aviso. La selección se representa mediante `?material=...&lesson=<ID-estable>`, compatible con enlaces anteriores que solo incluyen material y con recargas de GitHub Pages. Una lección inexistente o ajena al material recupera su primera lección, corrige la URL y muestra un aviso. La lección activa queda en la URL, no en almacenamiento local. Si el ID no está en el catálogo, se carga el primer material disponible, se corrige la URL y se muestra un aviso no bloqueante. Los errores de red, JSON, esquema o integridad conservan su mensaje de error y no activan este fallback. Todas las rutas de datos son relativas a sus documentos.

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
node --test tests/materials.test.mjs tests/library.test.mjs
```

Las pruebas de contrato y almacenamiento usan únicamente Node.js. Para las de navegador se necesita Playwright y un navegador compatible ya instalados:

```powershell
node tests/browser.cjs
```

Si Playwright está fuera de las rutas normales de Node, `PLAYWRIGHT_MODULE` puede señalar su ruta. `BROWSER_CHANNEL` selecciona el navegador; el valor predeterminado es `msedge`. No se descargan dependencias automáticamente.

Las pruebas cargan los cuatro paquetes aprobados; los materiales adicionales de prueba se sirven solo en memoria y no se añaden al catálogo. Las copias de trabajo para pruebas del validador, capturas y puntos recuperables están en `.local-review/`, ignorada. Las pruebas comprueban errores de JSON, esquemas, identidades, referencias, tiempos, catálogo, migración y aislamiento; el navegador cubre reproducción simulada, biblioteca, búsquedas, filtros, enlaces directos, foco del drawer, estados de carga, reintento, pestañas, temas y tamaños de 320 a 1440 px.

La regresión editorial compara las 15 lecciones con el commit publicado `a8c826966d9e11cd9e23096b5961b08aea558812`. Durante esta migración se comprobó además con YouTube real: Play del primer intervalo, finalización, preparación de la segunda lección en pausa y su inicio mediante Play nativo.

## Publicación e identidad

GitHub Pages se publica desde GitHub Actions mediante `.github/workflows/deploy-pages.yml`, que valida el contenido, ejecuta pruebas y publica `dist/`. En Settings → Pages, selecciona **GitHub Actions** como fuente. DigitalOcean usa el mismo artefacto `dist`.

`context/`, `design/`, `skills/`, `.local-review/`, archivos ZIP y metadatos de alojamiento permanecen ignorados. Solo los tres esquemas del empaquetador se copian a `public/materials/schema/`. Los paquetes dentro de `public/materials/` sí son contenido público versionado.

El logotipo SVG actual conserva Play y el aro segmentado e incorpora el ajuste aprobado de la pieza de rompecabezas ámbar. Ya no es una copia idéntica del SVG de referencia. Esta migración no modifica el logo ni el favicon.

Inter se aloja localmente en `assets/fonts/InterVariable.woff2`, con su licencia en `assets/fonts/OFL.txt`. Se mantienen los temas y el diseño compacto aprobados.
