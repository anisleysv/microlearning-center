import { createLibraryView } from './lib/library-view.mjs';
import { loadLibrary, loadPackage } from './lib/loader.mjs';
import { formatDuration, intervalLabel } from './lib/content.mjs';
import { createStateStore } from './lib/storage.mjs';
import { createPlayer } from './lib/player.mjs';

const $ = id => document.getElementById(id);
const preferences = window.MicrolearningPreferences;
const store = createStateStore();
let library, bundle, state, activeMode = 'full', activeIndex = 0;
let busy = true, generation = 0, request;
let playbackSpeed = preferences.get().playbackSpeed;
const route = () => bundle ? (activeMode === 'priority' ? bundle.lessons.filter(lesson => lesson.priority === 'high') : bundle.lessons) : [];
const currentLesson = () => route()[activeIndex];
const player = createPlayer({
  onProgress: time => { if (!busy && currentLesson()) renderClipProgress(time); },
  onFinish: id => { if (!busy && currentLesson()?.id === id) finishLesson(); },
  onStatus: (message, retry = false) => { if (!busy) { $('statusMessage').textContent = message; if (retry) $('retryButton').hidden = false; } },
  onSpeed: saveSpeed
});
const libraryView = createLibraryView({store,selectedId:()=>bundle?.material.id,onChoose:(id,lesson)=>void selectMaterial(id,true,lesson,true)});
function syncUrl() {
  const url=new URL(location.href);url.searchParams.set('material',bundle.material.id);url.searchParams.set('lesson',currentLesson().id);history.replaceState(null,'',url);
}
function element(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
function renderClipProgress(time = currentLesson().startSeconds) {
  const lesson = currentLesson(), duration = lesson.endSeconds - lesson.startSeconds;
  const ratio = Math.min(1,Math.max(0,(time - lesson.startSeconds)/duration));
  $('lessonTime').style.setProperty('--lesson-progress',ratio * 100 + '%');
  $('lessonTime').setAttribute('aria-valuenow',String(Math.round(ratio * 100)));
  $('lessonTime').setAttribute('aria-valuetext',formatDuration(Math.floor(ratio * duration))+' de '+formatDuration(duration));
}
function renderProgress() {
  const count = bundle.lessons.filter(l=>state.completed.has(l.id)).length;
  $('progressText').textContent = count+' de '+bundle.lessons.length+' completados';
  $('progressBar').style.width = count / bundle.lessons.length * 100 + '%';
  $('completeCheckbox').checked = state.completed.has(currentLesson().id);
  libraryView.refresh();
}
function renderList() {
  const fragment = document.createDocumentFragment();
  for (const lesson of route()) {
    const button = element('button',undefined,'lesson-item');
    button.dataset.lessonId = lesson.id;
    if (lesson.id === currentLesson().id) { button.classList.add('active'); button.setAttribute('aria-current','step'); }
    if (state.completed.has(lesson.id)) button.classList.add('completed');
    button.append(element('span',String(lesson.order).padStart(2,'0'),'item-number'));
    const copy = element('span',undefined,'item-copy');
    copy.append(element('strong',lesson.title),element('span',intervalLabel(lesson)));
    if (lesson.priority === 'high') copy.append(element('span','Alta prioridad','item-priority'));
    copy.append(element('span',state.completed.has(lesson.id)?'Completada':'Pendiente'));
    button.append(copy); fragment.append(button);
  }
  $('lessonList').replaceChildren(fragment);
}
function textList(id, values) { $(id).replaceChildren(...values.map(value=>element('li',value))); }
function renderLesson() {
  const lesson = currentLesson();
  $('lessonCounter').textContent = (activeIndex + 1)+' de '+route().length;
  $('lessonNumber').textContent = 'Microlección '+String(lesson.order).padStart(2,'0');
  $('lessonTime').textContent = intervalLabel(lesson);
  $('priorityBadge').hidden = lesson.priority !== 'high';
  $('lessonTitle').textContent = lesson.title; $('lessonSummary').textContent = lesson.summary;
  textList('lessonTakeaways',lesson.retentionPoints);
  textList('lessonSteps',lesson.steps || []); $('stepsBlock').hidden = !lesson.steps?.length;
  $('lessonTools').replaceChildren(...(lesson.tools || []).map(tool=>{
    const item = element('li');
    if (tool.url) { const link = element('a',tool.name); link.href = tool.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; item.append(link); }
    else item.textContent = tool.name;
    return item;
  }));
  $('toolsBlock').hidden = !lesson.tools?.length;
  $('promptTab').hidden = !lesson.prompt; $('lessonPrompt').textContent = lesson.prompt || '';
  selectLessonTab('takeawayTab');
  updateNavigation('prev',route()[activeIndex-1],'Anterior'); updateNavigation('next',route()[activeIndex+1],'Siguiente');
  renderLike(); renderProgress(); renderList();
}
function prepareLesson(focus = true, message = '') {
  player.cue(currentLesson()); renderLesson(); renderClipProgress(); syncUrl();
  $('statusMessage').textContent = message || 'Pulsa Play en YouTube cuando quieras comenzar.';
  if (focus) $('lessonTitle').focus({preventScroll:true});
}
function persistState() {
  libraryView.refresh();
  if (!store.save(bundle.material.id,state)) $('storageMessage').textContent = 'No se puede guardar el progreso ni Me gusta; se conservarán durante esta sesión.';
}
function finishLesson() {
  const lesson = currentLesson(); state.completed.add(lesson.id); persistState();
  if (activeIndex + 1 < route().length) { activeIndex++; prepareLesson(true,'Microlección '+lesson.order+' completada. La siguiente está preparada y en pausa.'); }
  else {
    player.pause(); renderLesson(); renderClipProgress(lesson.endSeconds);
    $('statusMessage').textContent = 'Recorrido finalizado: '+route().filter(l=>state.completed.has(l.id)).length+' de '+route().length+' completadas. Selecciona una microlección en el mapa para revisarla.';
  }
}
function updateNavigation(prefix, destination, action) {
  $(prefix+'Button').disabled = !destination;
  $(prefix+'Tooltip').hidden = !destination;
  $(prefix+'Tooltip').textContent = destination ? action+': '+destination.title : '';
  $(prefix+'Button').setAttribute('aria-label',destination ? action+': '+destination.title : action+' (no disponible)');
}
function renderLike() {
  const lesson = currentLesson(), selected = state.likes.has(lesson.id);
  $('likeButton').setAttribute('aria-pressed',String(selected));
  $('likeButton').setAttribute('aria-label',(selected?'Quitar la valoración de la microlección ':'Marcar la microlección ')+lesson.order+(selected?'':' como útil'));
  $('likeTooltip').textContent = selected ? 'Quitar Me gusta' : 'Me resulta útil';
}
function saveSpeed(speed) {
  if (![1,1.25,1.5,1.75,2].includes(speed)) return;
  playbackSpeed = speed; $('speedSelect').value = String(speed);
  if (!preferences.update({playbackSpeed:speed})) $('storageMessage').textContent = 'No se puede guardar la velocidad; se conservará durante esta sesión.';
}
function modeButtons() {
  document.querySelectorAll('.mode-button').forEach(button=>{
    const selected = button.dataset.mode === activeMode;
    button.classList.toggle('active',selected); button.setAttribute('aria-pressed',String(selected));
    button.disabled = busy || (button.dataset.mode === 'priority' && !bundle.lessons.some(l=>l.priority === 'high'));
  });
}
function renderMaterial() {
  const {material,source,stats} = bundle;
  $('materialTitle').textContent = material.title; $('materialDescription').textContent = material.description;
  document.title = 'Microlearning Center · '+material.title;
  document.querySelector('meta[name="description"]').content = material.description;
  document.querySelector('[data-mode="full"]').textContent = 'Completo · '+formatDuration(stats.selectedSeconds);
  document.querySelector('[data-mode="priority"]').textContent = 'Prioritario · '+formatDuration(stats.prioritySeconds);
  $('priorityHelp').hidden = bundle.lessons.some(l=>l.priority === 'high');
  $('curriculumTitle').textContent = stats.count+' ideas, una ruta clara';
  $('sourceTitle').textContent = source.officialTitle; $('sourceAuthor').textContent = source.author.name;
  $('sourceAttribution').textContent = source.attribution.text; $('footerAttribution').textContent = source.attribution.text;
  document.querySelectorAll('[data-source-link], #continueSource').forEach(link=>{link.href = source.url;});
  $('sourceDialogText').textContent = 'Vas a salir de Microlearning Center para visitar «'+source.officialTitle+'», de '+source.author.name+', en YouTube. Allí podrás ver el video completo, acceder al canal y suscribirte al autor.';
  modeButtons();
}
function loading(message) {
  busy = true; player.reset();
  $('sourceDialog').close(); $('retryButton').hidden = true;
  $('workspace').hidden = true; $('workspace').inert = true; $('curriculum').hidden = true;
  $('workspace').setAttribute('aria-busy','true');
  $('loadMessage').textContent = message;
  $('progressText').textContent = '—'; $('progressBar').style.width = '0%';
  document.querySelectorAll('[data-source-link]').forEach(link=>link.hidden = true);
}
function loadError(error) {
  $('loadMessage').textContent = 'No se pudo cargar el material. '+error.message;
  $('retryButton').hidden = false; $('workspace').setAttribute('aria-busy','false');
}
async function selectMaterial(id, updateUrl = true, lessonId, focus = false) {
  const token = ++generation; request?.abort(); request = new AbortController();
  loading('Cargando material…');
  const requested = library.materials.find(item=>item.material.id === id);
  // Only an unknown catalog ID can fall back; loading/validation errors stay visible.
  const item = requested || library.materials[0];
  try {
    if (!item) throw Error('El material solicitado no está en el catálogo. Selecciona otro material.');
    const next = await loadPackage(item,library.schemas,request.signal);
    if (token !== generation) return;
    bundle = next; state = store.load(bundle.material.id,bundle.lessons);
    const targetIndex = requested && lessonId ? bundle.lessons.findIndex(lesson=>lesson.id===lessonId) : -1;
    activeMode = 'full'; activeIndex = Math.max(0,targetIndex); busy = false;
    $('workspace').hidden = false; $('workspace').inert = false; $('curriculum').hidden = false;
    $('workspace').setAttribute('aria-busy','false');
    $('loadMessage').textContent = requested ? (lessonId && targetIndex<0 ? 'La microlección solicitada no estaba disponible. Se abrió la primera del material.' : '') : 'El material solicitado no estaba disponible. Se abrió el material predeterminado.';
    document.querySelectorAll('[data-source-link]').forEach(link=>link.hidden = false);
    $('storageMessage').textContent = state.persistent && preferences.available() ? '' : 'El almacenamiento no está disponible; los cambios se conservan durante esta sesión.';
    renderMaterial(); renderLesson(); renderClipProgress();
    $('statusMessage').textContent = 'Pulsa Play en YouTube cuando quieras comenzar.';
    if (updateUrl) syncUrl();
    if (focus) $('lessonTitle').focus({preventScroll:true});
    void player.setSource(bundle.source,currentLesson(),playbackSpeed);
  } catch (error) { if (token === generation && error.name !== 'AbortError') loadError(error); }
}
async function start() {
  const token = ++generation; request?.abort(); request = new AbortController();
  loading('Cargando materiales…');
  try {
    const nextLibrary = await loadLibrary(request.signal);
    if (token !== generation) return;
    library = nextLibrary;
    libraryView.setData(library);
    if (!library.materials.length) { $('loadMessage').textContent = 'Todavía no hay materiales publicados.'; $('materialTitle').textContent = 'Microlearning Center'; $('materialDescription').textContent = ''; $('retryButton').hidden = false; $('workspace').setAttribute('aria-busy','false'); return; }
    const params=new URL(location.href).searchParams;
    await selectMaterial(params.get('material') || library.materials[0].material.id,true,params.get('lesson'));
  } catch (error) { if (token === generation && error.name !== 'AbortError') loadError(error); }
}
$('retryButton').addEventListener('click',()=>void start());
for (const [id,direction] of [['prevButton',-1],['nextButton',1]]) $(id).addEventListener('click',()=>{
  if (busy || activeIndex+direction<0 || activeIndex+direction>=route().length) return;
  activeIndex+=direction; prepareLesson();
});
$('lessonList').addEventListener('click',event=>{
  if (busy) return; const button = event.target.closest('[data-lesson-id]'); if (!button) return;
  const index = route().findIndex(lesson=>lesson.id === button.dataset.lessonId); if (index<0) return;
  activeIndex=index; prepareLesson(); $('lessonTitle').scrollIntoView({behavior:'smooth',block:'center'});
});
document.querySelectorAll('.mode-button').forEach(button=>button.addEventListener('click',()=>{
  if (busy || button.disabled) return; activeMode=button.dataset.mode; activeIndex=0; modeButtons(); prepareLesson();
}));
$('speedSelect').value = String(playbackSpeed);
$('speedSelect').addEventListener('change',()=>{saveSpeed(Number($('speedSelect').value)); player.setSpeed(playbackSpeed);});
$('completeCheckbox').addEventListener('change',()=>{ if (busy) return; const id=currentLesson().id; $('completeCheckbox').checked?state.completed.add(id):state.completed.delete(id); persistState(); renderProgress(); renderList(); });
$('likeButton').addEventListener('click',()=>{if (busy) return; const id=currentLesson().id; state.likes.has(id)?state.likes.delete(id):state.likes.add(id); renderLike(); persistState();});
$('resetButton').addEventListener('click',()=>{if (busy) return; state.completed.clear(); prepareLesson(); persistState();});
$('copyPromptButton').addEventListener('click',async()=>{
  if (busy) return; const token=generation;
  try { await navigator.clipboard.writeText(currentLesson().prompt || ''); if (token===generation) $('statusMessage').textContent='Plantilla copiada.'; }
  catch { if (token===generation) $('statusMessage').textContent='No se pudo copiar. Selecciona la plantilla y copia el texto manualmente.'; }
});
document.querySelectorAll('[data-source-link]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault(); if (!busy) $('sourceDialog').showModal();}));
$('cancelSource').addEventListener('click',()=>$('sourceDialog').close());
$('continueSource').addEventListener('click',()=>$('sourceDialog').close());
document.querySelectorAll('.tooltip-wrap').forEach(wrapper=>{
  wrapper.addEventListener('pointerenter',()=>wrapper.classList.remove('tooltip-dismissed'));
  wrapper.addEventListener('focusin',()=>wrapper.classList.remove('tooltip-dismissed'));
});
document.addEventListener('keydown',event=>{if (event.key==='Escape') document.querySelectorAll('.tooltip-wrap').forEach(wrapper=>wrapper.classList.add('tooltip-dismissed'));});
window.addEventListener('pagehide',()=>{request?.abort(); player.pause();});
window.addEventListener('popstate',()=>{if(library){const params=new URL(location.href).searchParams;void selectMaterial(params.get('material')||library.materials[0]?.material.id,true,params.get('lesson'));}});
void start();

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
