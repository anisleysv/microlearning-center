const VIDEO_ID = 'S6up3AnyARo';
const STORAGE_KEY = 'ia58-progress-v1';

const lessons = [
  {
    id: 1, start: 1597, end: 1747, time: '00:26:37–00:29:07', priority: true,
    title: 'Auditar tareas candidatas para IA',
    summary: 'Localiza primero las tareas repetitivas, lentas y de poco valor. La herramienta viene después del problema.',
    takeaways: ['Enumera tareas diarias y semanales.', 'Marca repetición, demora y bajo valor diferencial.', 'Prioriza un proceso delimitado y medible.']
  },
  {
    id: 2, start: 2263, end: 2458, time: '00:37:43–00:40:58', priority: false,
    title: 'Automatizar el procesamiento de facturas',
    summary: 'Un flujo puede revisar Gmail, procesar facturas con IA y registrar campos estructurados en Google Sheets.',
    takeaways: ['Usa Make.com como orquestador.', 'Extrae campos definidos, no texto libre.', 'Mantén revisión contable humana.'],
    prompt: 'Extrae número, fecha de emisión, razón social, concepto, base imponible, porcentaje y cuota de IVA e importe total. Devuelve únicamente los campos solicitados.'
  },
  {
    id: 3, start: 2467, end: 2659, time: '00:41:07–00:44:19', priority: false,
    title: 'Crear un sistema de diseño reutilizable',
    summary: 'Proporciona identidad visual, referencias y reglas para producir materiales consistentes sin reconstruir el contexto.',
    takeaways: ['Aporta logotipo, colores, tipografías y piezas aprobadas.', 'Define la estructura de cada entregable.', 'Revisa coherencia antes de publicar.']
  },
  {
    id: 4, start: 2764, end: 3003, time: '00:46:04–00:50:03', priority: false,
    title: 'Construir un agente ejecutivo diario',
    summary: 'Consolida Slack, Notion, Calendar y Gmail para recibir prioridades, compromisos y comunicaciones relevantes.',
    takeaways: ['Define fuentes y frecuencia del reporte.', 'Explica tus criterios de urgencia e importancia.', 'Autoriza respuestas automáticas solo cuando sea seguro.'],
    prompt: 'Revisa mis fuentes, identifica lo pendiente y prioriza lo que requiere mi atención según urgencia, importancia y posibilidad de delegación.'
  },
  {
    id: 5, start: 3126, end: 3394, time: '00:52:06–00:56:34', priority: false,
    title: 'Automatizar llamadas y reservaciones',
    summary: 'Un agente de voz puede responder consultas acotadas, comprobar disponibilidad y reservar una cita.',
    takeaways: ['Recoge solo los datos necesarios.', 'Consulta el calendario antes de confirmar.', 'Ofrece alternativas cuando el horario no esté disponible.']
  },
  {
    id: 6, start: 4569, end: 4715, time: '01:16:09–01:18:35', priority: false,
    title: 'Mejorar el resultado controlando la entrada',
    summary: 'La salida mejora cuando el prompt funciona como una especificación clara del trabajo.',
    takeaways: ['Evalúa precisión, utilidad y adecuación.', 'Corrige la instrucción cuando el resultado falla.', 'No confundas una mala dirección con una herramienta incapaz.']
  },
  {
    id: 7, start: 4720, end: 4946, time: '01:18:40–01:22:26', priority: true,
    title: 'Aplicar el método ROCE',
    summary: 'Estructura cada petición con Rol, Objetivo, Contexto y Estructura para obtener una respuesta controlable.',
    takeaways: ['Rol: especialidad pertinente.', 'Objetivo: una meta principal.', 'Contexto: datos, restricciones y fuentes.', 'Estructura: formato exacto de salida.'],
    prompt: 'ROL\nActúa como [especialista pertinente].\n\nOBJETIVO\nRealiza [resultado concreto y verificable].\n\nCONTEXTO\nConsidera [situación, datos, restricciones y documentos].\n\nESTRUCTURA\nDevuelve: 1) [sección], 2) [sección], 3) [recomendación y próximos pasos].'
  },
  {
    id: 8, start: 5074, end: 5345, time: '01:24:34–01:29:05', priority: false,
    title: 'Elegir funciones y modelos según la tarea',
    summary: 'Combina el modelo, las fuentes y la modalidad de entrada de acuerdo con la complejidad real del trabajo.',
    takeaways: ['Modelo rápido para tareas rutinarias.', 'Razonamiento para análisis complejos.', 'Usa archivos, búsqueda o voz cuando aporten contexto.']
  },
  {
    id: 9, start: 5354, end: 5787, time: '01:29:14–01:36:27', priority: false,
    title: 'Aplicar ROCE a un informe profesional',
    summary: 'Una solicitud con destinatario, restricciones, criterios y formato produce un informe mucho más utilizable.',
    takeaways: ['Identifica al destinatario.', 'Incluye restricciones y criterios de comparación.', 'Pide recomendación razonada y próximos pasos.'],
    prompt: 'Redacta un informe personalizado para [destinatario]. Considera sus prioridades, restricciones y alternativas. Devuelve un resumen ejecutivo, una tabla comparativa, una recomendación razonada y tres próximos pasos.'
  },
  {
    id: 10, start: 5794, end: 6188, time: '01:36:34–01:43:08', priority: true,
    title: 'Analizar documentos y generar cuadros de mando',
    summary: 'Combina instrucciones estructuradas con archivos reales para extraer indicadores, riesgos y acciones prioritarias.',
    takeaways: ['Adjunta el histórico pertinente.', 'Define KPI, alertas y horizonte temporal.', 'Exige que indique los datos ausentes.'],
    prompt: 'Analiza el histórico adjunto. Devuelve KPI con valor y tendencia, semáforos de alerta, principales riesgos y tres acciones prioritarias. No inventes datos: señala expresamente cualquier información ausente.'
  },
  {
    id: 11, start: 6259, end: 6608, time: '01:44:19–01:50:08', priority: false,
    title: 'Crear un artefacto interactivo con datos',
    summary: 'Transforma documentos conectados en un panel visual con escenarios, métricas y decisiones próximas.',
    takeaways: ['Confirma primero qué archivos fueron leídos.', 'Solicita escenarios con supuestos explícitos.', 'Valida cifras y recomendaciones antes de usarlas.']
  },
  {
    id: 12, start: 6632, end: 6854, time: '01:50:32–01:54:14', priority: true,
    title: 'Crear agentes para tareas recurrentes',
    summary: 'Convierte una tarea repetida en un asistente con instrucciones, conocimiento y herramientas permanentes.',
    takeaways: ['Selecciona una tarea estable y repetitiva.', 'Separa instrucciones, conocimiento y herramientas.', 'Concede únicamente los accesos necesarios.']
  },
  {
    id: 13, start: 6863, end: 7134, time: '01:54:23–01:58:54', priority: false,
    title: 'Construir un agente editorial especializado',
    summary: 'Un agente que conoce tu catálogo, tono y método puede planificar contenido sin recibir todo el contexto otra vez.',
    takeaways: ['Carga conocimiento aprobado y vigente.', 'Define tono, audiencia y método editorial.', 'Exige variedad y verifica hechos antes de publicar.'],
    prompt: 'Planifica siete publicaciones sobre [producto] usando ángulos distintos. Devuelve una tabla con día, objetivo, audiencia, gancho e idea visual. Evita repeticiones.'
  },
  {
    id: 14, start: 8059, end: 8106, time: '02:14:19–02:15:06', priority: true,
    title: 'Usar la experiencia humana como control de calidad',
    summary: 'La experiencia profesional permite detectar respuestas convincentes pero incorrectas antes de utilizarlas.',
    takeaways: ['Contrasta la respuesta con evidencia.', 'No entregues una salida sin revisarla.', 'Reserva la decisión y la responsabilidad para una persona.']
  },
  {
    id: 15, start: 8144, end: 8237, time: '02:15:44–02:17:17', priority: false,
    title: 'No perseguir siempre el modelo más nuevo',
    summary: 'Elige una herramienta suficiente, prueba con tareas reales e itera antes de pagar por más capacidad.',
    takeaways: ['Selecciona por necesidad, no por novedad.', 'Prueba tres a cinco iteraciones.', 'Usa voz cuando describir el contexto sea más rápido.']
  }
];

let player;
let playerReady = false;
let activeMode = 'full';
let activeIndex = 0;
let playbackLessonId = null;
let intervalArmed = false;
let routeFinished = false;
const $ = (id) => document.getElementById(id);
// Reuse the previous favorites key so existing selections become likes without data loss.
const LIKES_KEY = 'ia58-favorites-v1';
const SPEED_KEY = 'ia58-speed-v1';
const completed = new Set(readLessonIds(STORAGE_KEY));
const likes = new Set(readLessonIds(LIKES_KEY));
let awaitingCue = true;
let playbackSpeed = readSpeed();

// Preserve the original storage key and reject corrupt or unrelated IDs.
function readLessonIds(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(saved) ? saved.filter((id) => lessons.some((lesson) => lesson.id === id)) : [];
  } catch { return []; }
}
function persistProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed])); }
  catch { $('statusMessage').textContent = 'El navegador no permite guardar el progreso; se conservará solo durante esta sesión.'; }
}
function route() { return activeMode === 'priority' ? lessons.filter((lesson) => lesson.priority) : lessons; }
function currentLesson() { return route()[activeIndex]; }
function formatTime(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}
function renderClipProgress(videoTime = currentLesson().start) {
  const lesson = currentLesson();
  const duration = lesson.end - lesson.start;
  const ratio = Math.min(1, Math.max(0, (videoTime - lesson.start) / duration));
  const pill = $('lessonTime');
  pill.style.setProperty('--lesson-progress', (ratio * 100) + '%');
  // No live region: assistive technology can query progress without constant announcements.
  const percent = String(Math.round(ratio * 100));
  if (pill.getAttribute('aria-valuenow') !== percent) pill.setAttribute('aria-valuenow', percent);
  pill.setAttribute('aria-valuetext', formatTime(ratio * duration) + ' de ' + formatTime(duration));
}
function renderProgress() {
  $('progressText').textContent = `${completed.size} de ${lessons.length} completados`;
  $('progressBar').style.width = `${completed.size / lessons.length * 100}%`;
  $('completeCheckbox').checked = completed.has(currentLesson().id);
}
function renderList() {
  $('lessonList').innerHTML = lessons.map((lesson) => `
    <button class="lesson-item ${lesson.id === currentLesson().id ? 'active' : ''} ${completed.has(lesson.id) ? 'completed' : ''} ${activeMode === 'priority' && !lesson.priority ? 'filtered' : ''}" data-lesson-id="${lesson.id}" ${lesson.id === currentLesson().id ? 'aria-current="step"' : ''}>
      <span class="item-number">${String(lesson.id).padStart(2, '0')}</span>
      <span class="item-copy"><strong>${lesson.title}</strong><span>${lesson.time}</span>
      ${lesson.priority ? '<span class="item-priority">Alta prioridad</span>' : ''}
      <span>${completed.has(lesson.id) ? 'Completada' : 'Pendiente'}</span></span>
    </button>`).join('');
}
function renderLesson() {
  const lesson = currentLesson();
  $('lessonCounter').textContent = `${activeIndex + 1} de ${route().length}`;
  $('lessonNumber').textContent = 'Microlección ' + String(lesson.id).padStart(2, '0');
  $('lessonTime').textContent = lesson.time;
  $('priorityBadge').hidden = !lesson.priority;
  $('lessonTitle').textContent = lesson.title;
  $('lessonSummary').textContent = lesson.summary;
  $('lessonTakeaways').innerHTML = lesson.takeaways.map((item) => `<li>${item}</li>`).join('');
  $('promptTab').hidden = !lesson.prompt;
  selectLessonTab('takeawayTab');
  $('lessonPrompt').textContent = lesson.prompt || '';
  updateNavigation('prev', route()[activeIndex - 1], 'Anterior');
  updateNavigation('next', route()[activeIndex + 1], 'Siguiente');
  renderLike();
  renderProgress();
  renderList();
}
function cueCurrentLesson() {
  if (!playerReady) return;
  const lesson = currentLesson();
  awaitingCue = true;
  player.pauseVideo();
  player.cueVideoById({ videoId: VIDEO_ID, startSeconds: lesson.start, endSeconds: lesson.end });
}
function prepareLesson(focus = true, message = '') {
  // Revoke the old interval before cueing: YouTube events can arrive asynchronously.
  playbackLessonId = null;
  intervalArmed = false;
  awaitingCue = true;
  routeFinished = false;
  cueCurrentLesson();
  renderLesson();
  renderClipProgress();
  $('statusMessage').textContent = message || 'Pulsa Play en YouTube cuando quieras comenzar.';
  if (focus) $('lessonTitle').focus({ preventScroll: true });
}
function moveLesson(direction) {
  const index = activeIndex + direction;
  if (index < 0 || index >= route().length) return;
  activeIndex = index;
  prepareLesson();
}
function showRouteSummary() {
  playbackLessonId = null;
  intervalArmed = false;
  routeFinished = true;
  if (playerReady) player.pauseVideo();
  renderLesson();
  renderClipProgress(currentLesson().end);
  $('statusMessage').textContent = 'Recorrido finalizado: ' + route().filter((lesson) => completed.has(lesson.id)).length + ' de ' + route().length + ' completadas. Selecciona una microlección en el mapa para revisarla.';
}
function finishLesson() {
  const lesson = currentLesson();
  // A late ENDED event must never complete a newly prepared lesson.
  if (playbackLessonId !== lesson.id || !intervalArmed || player.getCurrentTime() < lesson.end - 0.25) return;
  playbackLessonId = null;
  intervalArmed = false;
  completed.add(lesson.id);
  if (activeIndex < route().length - 1) {
    activeIndex += 1;
    prepareLesson(true, `Microlección ${lesson.id} completada. La siguiente está preparada y en pausa.`);
  } else { showRouteSummary(); }
  persistProgress();
}
function updatePlayerProgress() {
  if (!playerReady || playbackLessonId !== currentLesson().id || !intervalArmed) return;
  // Use media time only; wall time, pauses and loading never add progress.
  if (player.getPlayerState() !== YT.PlayerState.PLAYING) return;
  const time = player.getCurrentTime();
  renderClipProgress(time);
  if (time >= currentLesson().end) finishLesson();
}
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('player', {
    videoId: VIDEO_ID,
    playerVars: { playsinline: 1, rel: 0, autoplay: 0, controls: 1, cc_load_policy: 1, cc_lang_pref: 'es', hl: 'es', start: lessons[0].start, origin: window.location.origin },
    events: {
      onReady: () => {
        playerReady = true;
        cueCurrentLesson();
        player.getIframe().title = 'Reproductor de YouTube: microlección actual';
        window.setInterval(updatePlayerProgress, 250);
      },
      onStateChange: (event) => {
        const lesson = currentLesson();
        if (event.data === YT.PlayerState.CUED) {
          awaitingCue = false;
          return;
        }
        if (event.data === YT.PlayerState.PLAYING) {
          if (awaitingCue || routeFinished) { player.pauseVideo(); return; }
          const time = player.getCurrentTime();
          // A native Play after CUED starts the selected interval; stale events cannot arm it.
          if (!intervalArmed && time >= lesson.start - 1 && time < lesson.end) {
            playbackLessonId = lesson.id;
            intervalArmed = true;
            player.setPlaybackRate(playbackSpeed);
            $('statusMessage').textContent = '';
          }
          updatePlayerProgress();
        } else if (event.data === YT.PlayerState.PAUSED && intervalArmed) {
          renderClipProgress(player.getCurrentTime());
        } else if (event.data === YT.PlayerState.ENDED) { finishLesson(); }
      },
      onPlaybackRateChange: (event) => {
        if (intervalArmed && !awaitingCue) saveSpeed(event.data);
      },
      onError: () => {
        $('statusMessage').textContent = 'No se pudo reproducir el video. Puedes volver a seleccionar la lección o visitar la fuente original desde su tarjeta.';
      }
    }
  });
};
$('prevButton').addEventListener('click', () => moveLesson(-1));
$('nextButton').addEventListener('click', () => moveLesson(1));
$('lessonList').addEventListener('click', (event) => {
  const button = event.target.closest('[data-lesson-id]');
  if (!button) return;
  const index = route().findIndex((lesson) => lesson.id === Number(button.dataset.lessonId));
  if (index < 0) return;
  activeIndex = index;
  prepareLesson();
  $('lessonTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
document.querySelectorAll('.mode-button').forEach((button) => {
  button.addEventListener('click', () => {
    activeMode = button.dataset.mode;
    activeIndex = 0;
    document.querySelectorAll('.mode-button').forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    prepareLesson();
  });
});
$('speedSelect').value = String(playbackSpeed);
$('speedSelect').addEventListener('change', () => {
  saveSpeed(Number($('speedSelect').value));
  if (playerReady) player.setPlaybackRate(playbackSpeed);
});
$('completeCheckbox').addEventListener('change', () => {
  const id = currentLesson().id;
  $('completeCheckbox').checked ? completed.add(id) : completed.delete(id);
  persistProgress(); renderProgress(); renderList();
});
$('copyPromptButton').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentLesson().prompt || '');
    $('statusMessage').textContent = 'Plantilla copiada.';
  } catch { $('statusMessage').textContent = 'No se pudo copiar. Selecciona la plantilla y copia el texto manualmente.'; }
});
$('resetButton').addEventListener('click', () => {
  completed.clear(); prepareLesson(); persistProgress();
});
// Native dialog provides modal focus containment, Escape and focus restoration.
document.querySelectorAll('[data-source-link]').forEach((link) => {
  link.addEventListener('click', (event) => { event.preventDefault(); $('sourceDialog').showModal(); });
});
$('cancelSource').addEventListener('click', () => $('sourceDialog').close());
$('continueSource').addEventListener('click', () => $('sourceDialog').close());
function updateNavigation(prefix, destination, action) {
  const button = $(prefix + 'Button');
  const tooltip = $(prefix + 'Tooltip');
  button.disabled = !destination;
  tooltip.hidden = !destination;
  tooltip.textContent = destination ? action + ': ' + destination.title : '';
  button.setAttribute('aria-label', destination ? action + ': ' + destination.title : action + ' (no disponible)');
}
function renderLike() {
  const id = currentLesson().id;
  const selected = likes.has(id);
  const label = selected ? 'Quitar la valoración de la microlección ' + id : 'Marcar la microlección ' + id + ' como útil';
  $('likeButton').setAttribute('aria-pressed', String(selected));
  $('likeButton').setAttribute('aria-label', label);
  $('likeTooltip').textContent = selected ? 'Quitar Me gusta' : 'Me resulta útil';
}
$('likeButton').addEventListener('click', () => {
  const id = currentLesson().id;
  likes.has(id) ? likes.delete(id) : likes.add(id);
  renderLike();
  try { localStorage.setItem(LIKES_KEY, JSON.stringify([...likes])); }
  catch { $('statusMessage').textContent = 'No se pueden guardar las valoraciones; se conservarán solo durante esta sesión.'; }
});
function readSpeed() {
  try {
    const speed = Number(localStorage.getItem(SPEED_KEY));
    return [1, 1.25, 1.5, 1.75, 2].includes(speed) ? speed : 1.5;
  } catch { return 1.5; }
}
function saveSpeed(speed) {
  if (![1, 1.25, 1.5, 1.75, 2].includes(speed)) return;
  playbackSpeed = speed;
  $('speedSelect').value = String(speed);
  try { localStorage.setItem(SPEED_KEY, String(speed)); }
  catch { $('statusMessage').textContent = 'No se puede guardar la velocidad; se conservará solo durante esta sesión.'; }
}
// Tooltips support hover, keyboard focus and Escape without moving focus.
document.querySelectorAll('.tooltip-wrap').forEach((wrapper) => {
  wrapper.addEventListener('pointerenter', () => wrapper.classList.remove('tooltip-dismissed'));
  wrapper.addEventListener('focusin', () => wrapper.classList.remove('tooltip-dismissed'));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') document.querySelectorAll('.tooltip-wrap').forEach((wrapper) => wrapper.classList.add('tooltip-dismissed'));
});
prepareLesson(false);

function selectLessonTab(id, focus = false) {
  document.querySelectorAll('.lesson-tabs [role="tab"]').forEach((tab) => {
    const selected = tab.id === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) tab.focus();
  });
  document.querySelector('.lesson-panels').scrollTop = 0;
}
document.querySelector('.lesson-tabs').addEventListener('click', (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (tab) selectLessonTab(tab.id);
});
// Follow the horizontal tab pattern, excluding unavailable optional content.
document.querySelector('.lesson-tabs').addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...document.querySelectorAll('.lesson-tabs [role="tab"]')].filter((tab) => !tab.hidden);
  const current = tabs.indexOf(document.activeElement);
  if (current < 0) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  selectLessonTab(tabs[next].id, true);
});
