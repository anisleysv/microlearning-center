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
let monitorId;
let started = false;
let intervalArmed = false;

// Invalid or unavailable storage must not prevent startup.
function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((id) => lessons.some((lesson) => lesson.id === id)) : [];
  } catch { return []; }
}
const completed = new Set(readProgress());
const elements = {
  cover: document.querySelector('#playerCover'),
  start: document.querySelector('#startButton'),
  prev: document.querySelector('#prevButton'),
  next: document.querySelector('#nextButton'),
  counter: document.querySelector('#lessonCounter'),
  playerTopic: document.querySelector('#playerTopic'),
  number: document.querySelector('#lessonNumber'),
  time: document.querySelector('#lessonTime'),
  badge: document.querySelector('#priorityBadge'),
  title: document.querySelector('#lessonTitle'),
  summary: document.querySelector('#lessonSummary'),
  takeaways: document.querySelector('#lessonTakeaways'),
  promptBlock: document.querySelector('#promptBlock'),
  prompt: document.querySelector('#lessonPrompt'),
  copyPrompt: document.querySelector('#copyPromptButton'),
  checkbox: document.querySelector('#completeCheckbox'),
  list: document.querySelector('#lessonList'),
  progressText: document.querySelector('#progressText'),
  progressBar: document.querySelector('#progressBar'),
  speed: document.querySelector('#speedSelect'),
  reset: document.querySelector('#resetButton'),
  status: document.querySelector('#statusMessage')
};

function route() {
  return activeMode === 'priority' ? lessons.filter((lesson) => lesson.priority) : lessons;
}

function currentLesson() {
  return route()[activeIndex];
}

function persistProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    elements.status.textContent = 'El navegador no permite guardar el progreso; se conservará solo durante esta sesión.';
  }
}

function renderProgress() {
  const count = completed.size;
  elements.progressText.textContent = `${count} de ${lessons.length} completados`;
  elements.progressBar.style.width = `${(count / lessons.length) * 100}%`;
}

function renderList() {
  elements.list.innerHTML = lessons.map((lesson) => `
    <button class="lesson-item ${lesson.id === currentLesson().id ? 'active' : ''} ${completed.has(lesson.id) ? 'completed' : ''} ${activeMode === 'priority' && !lesson.priority ? 'filtered' : ''}" data-lesson-id="${lesson.id}">
      <span class="item-number">${String(lesson.id).padStart(2, '0')}</span>
      <span class="item-copy">
        <strong>${lesson.title}</strong>
        <span>${lesson.time}</span>
        ${lesson.priority ? '<span class="item-priority">Alta prioridad</span>' : ''}
      </span>
    </button>
  `).join('');

  elements.list.querySelectorAll('.lesson-item').forEach((button) => {
    button.addEventListener('click', () => selectLesson(Number(button.dataset.lessonId), true));
  });
}

function renderLesson() {
  const lesson = currentLesson();
  const currentRoute = route();
  elements.counter.textContent = `Lección ${activeIndex + 1} de ${currentRoute.length}`;
  elements.playerTopic.textContent = lesson.title;
  elements.number.textContent = String(lesson.id).padStart(2, '0');
  elements.time.textContent = lesson.time;
  elements.badge.hidden = !lesson.priority;
  elements.title.textContent = lesson.title;
  elements.summary.textContent = lesson.summary;
  elements.takeaways.innerHTML = lesson.takeaways.map((item) => `<li>${item}</li>`).join('');
  elements.promptBlock.hidden = !lesson.prompt;
  elements.prompt.textContent = lesson.prompt || '';
  elements.checkbox.checked = completed.has(lesson.id);
  elements.prev.disabled = activeIndex === 0;
  elements.next.disabled = activeIndex === currentRoute.length - 1;
  renderList();
}

function playActiveLesson() {
  if (!playerReady) {
    elements.status.textContent = 'Preparando el reproductor…';
    return;
  }

  const lesson = currentLesson();
  // Ignore stale events while the next interval loads.
  intervalArmed = false;
  player.loadVideoById({
    videoId: VIDEO_ID,
    startSeconds: lesson.start,
    endSeconds: lesson.end
  });
  player.setPlaybackRate(Number(elements.speed.value));
  elements.cover.classList.add('hidden');
  elements.status.textContent = 'El siguiente fragmento comenzará automáticamente.';
  started = true;
}

function selectLesson(lessonId, play = false) {
  const currentRoute = route();
  const nextIndex = currentRoute.findIndex((lesson) => lesson.id === lessonId);
  if (nextIndex < 0) return;
  activeIndex = nextIndex;
  renderLesson();
  if (play || started) playActiveLesson();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function moveLesson(direction) {
  const nextIndex = activeIndex + direction;
  if (nextIndex < 0 || nextIndex >= route().length) return;
  activeIndex = nextIndex;
  renderLesson();
  playActiveLesson();
}

function finishLesson() {
  if (!started || !intervalArmed) return;
  intervalArmed = false;
  const lesson = currentLesson();
  completed.add(lesson.id);
  persistProgress();
  renderProgress();

  if (activeIndex < route().length - 1) {
    activeIndex += 1;
    renderLesson();
    playActiveLesson();
  } else {
    started = false;
    player.pauseVideo();
    renderLesson();
    elements.status.textContent = 'Recorrido completado. Puedes revisar cualquier lección desde el mapa.';
  }
}

function startMonitor() {
  window.clearInterval(monitorId);
  monitorId = window.setInterval(() => {
    if (!playerReady || !started || !intervalArmed || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
    const lesson = currentLesson();
    if (player.getCurrentTime() >= lesson.end - 0.2) finishLesson();
  }, 250);
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: VIDEO_ID,
    playerVars: {
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
      start: lessons[0].start
    },
    events: {
      onReady: () => {
        playerReady = true;
        elements.status.textContent = 'Reproductor preparado.';
        player.setPlaybackRate(Number(elements.speed.value));
        startMonitor();
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING && started) {
          const time = player.getCurrentTime();
          const lesson = currentLesson();
          if (time >= lesson.start - 1 && time < lesson.end) {
            intervalArmed = true;
            // Loading a video can reset the playback rate.
            player.setPlaybackRate(Number(elements.speed.value));
          }
        } else if (event.data === YT.PlayerState.ENDED) {
          finishLesson();
        }
      },
      onError: () => {
        elements.status.innerHTML = 'No se pudo cargar el reproductor. <a href="https://www.youtube.com/watch?v=S6up3AnyARo" target="_blank" rel="noopener noreferrer">Abre el video original</a>.';
      }
    }
  });
};

elements.start.addEventListener('click', playActiveLesson);
elements.prev.addEventListener('click', () => moveLesson(-1));
elements.next.addEventListener('click', () => moveLesson(1));

document.querySelectorAll('.mode-button').forEach((button) => {
  button.addEventListener('click', () => {
    activeMode = button.dataset.mode;
    activeIndex = 0;
    document.querySelectorAll('.mode-button').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    renderLesson();
    if (started) playActiveLesson();
  });
});

elements.speed.addEventListener('change', () => {
  if (playerReady) player.setPlaybackRate(Number(elements.speed.value));
});

elements.checkbox.addEventListener('change', () => {
  const lessonId = currentLesson().id;
  elements.checkbox.checked ? completed.add(lessonId) : completed.delete(lessonId);
  persistProgress();
  renderProgress();
  renderList();
});

elements.copyPrompt.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentLesson().prompt || '');
  } catch {
    elements.status.textContent = 'No se pudo copiar. Selecciona la plantilla y copia el texto manualmente.';
    return;
  }
  const originalText = elements.copyPrompt.textContent;
  elements.copyPrompt.textContent = 'Copiado';
  window.setTimeout(() => { elements.copyPrompt.textContent = originalText; }, 1200);
});

elements.reset.addEventListener('click', () => {
  completed.clear();
  persistProgress();
  renderProgress();
  renderLesson();
});

renderProgress();
renderLesson();
