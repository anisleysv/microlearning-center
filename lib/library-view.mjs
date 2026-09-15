import { libraryEntry, filterLibrary } from './library.mjs';
import { formatDuration } from './content.mjs';
const $ = id=>document.getElementById(id);
function node(tag,text,className) { const item=document.createElement(tag); if(text!==undefined)item.textContent=text; if(className)item.className=className; return item; }
export function createLibraryView({ store, onChoose, selectedId }) {
  let items=[], index={topics:[],materials:[]};
  const mobile=matchMedia('(max-width: 1279px)');
  let desktopOpen=innerWidth>=1440;
  const panel=$('libraryPanel'),dialog=$('libraryDrawer'),toggle=$('libraryToggle');
  function expanded(value) { toggle.setAttribute('aria-expanded',String(value)); toggle.setAttribute('aria-label',value?'Cerrar biblioteca':'Abrir biblioteca'); }
  function close() {
    if(mobile.matches) { if(dialog.open)dialog.close(); }
    else { desktopOpen=false; panel.hidden=true; document.body.classList.remove('library-open'); expanded(false); toggle.focus(); }
  }
  function configure() {
    if(dialog.open)dialog.close();
    if(mobile.matches) { dialog.append(panel); panel.hidden=false; document.body.classList.remove('library-open'); toggle.setAttribute('aria-controls','libraryDrawer'); expanded(false); }
    else { $('libraryDock').append(panel); panel.hidden=!desktopOpen; document.body.classList.toggle('library-open',desktopOpen); toggle.setAttribute('aria-controls','libraryPanel'); expanded(desktopOpen); }
  }
  toggle.addEventListener('click',()=>{
    if(mobile.matches){ if(dialog.open)dialog.close(); else {dialog.showModal();expanded(true);$('librarySearch').focus();} }
    else {desktopOpen=!desktopOpen;panel.hidden=!desktopOpen;document.body.classList.toggle('library-open',desktopOpen);expanded(desktopOpen);if(desktopOpen)$('librarySearch').focus();}
  });
  $('libraryClose').addEventListener('click',close);
  dialog.addEventListener('close',()=>expanded(false));
  // Keep Tab cycling inside the drawer, including browser focus-boundary cases.
  dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const controls=[...dialog.querySelectorAll('button, input, select, a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
    const first=controls[0], last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  mobile.addEventListener('change',configure);configure();
  function link(text,entry,lesson) {
    const anchor=node('a',text);const url=new URL(location.href);url.searchParams.set('material',entry.id);
    if(lesson)url.searchParams.set('lesson',lesson.id);else url.searchParams.delete('lesson');anchor.href=url.href;
    anchor.dataset.materialId=entry.id;if(lesson)anchor.dataset.lessonId=lesson.id;
    anchor.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();if(mobile.matches)close();onChoose(entry.id,lesson?.id);});
    return anchor;
  }
  function refresh() {
    const entries=items.map(item=>libraryEntry(item,index,store.load(item.material.id,item.bundle.lessons)));
    const results=filterLibrary(entries,{query:$('librarySearch').value,language:$('languageFilter').value,topic:$('topicFilter').value,status:$('statusFilter').value,liked:$('likedFilter').checked});
    const list=document.createDocumentFragment();
    for(const entry of results){
      const row=node('li',undefined,'library-card');const title=link(entry.title,entry);title.className='library-title';title.title=entry.officialTitle;
      if(entry.id===selectedId()){title.setAttribute('aria-current','true');row.classList.add('selected');}
      row.append(title,node('p',entry.author+' · '+entry.language.toUpperCase(),'library-author'));
      row.append(node('p',entry.lessonCount+' microlecciones · '+formatDuration(entry.selectedDurationSeconds),'library-meta'));
      row.append(node('p','Prioritario · '+formatDuration(entry.priorityDurationSeconds),'library-meta'));
      const progress=node('progress');progress.max=entry.lessonCount;progress.value=entry.completed;progress.setAttribute('aria-label','Progreso de '+entry.title);
      row.append(progress,node('p',entry.completed+' de '+entry.lessonCount+' completadas'+(entry.liked?' · Con Me gusta':''),'library-meta'));
      if(entry.matchingLessons.length){const matches=node('ul',undefined,'library-matches');for(const lesson of entry.matchingLessons){const item=node('li');item.append(link('Microlección '+lesson.order+' · '+lesson.title,entry,lesson));matches.append(item);}row.append(matches);}
      list.append(row);
    }
    $('libraryResults').replaceChildren(list);
    $('libraryCount').textContent=results.length+' '+(results.length===1?'material':'materiales');
    $('libraryEmpty').hidden=results.length>0;
  }
  for(const id of ['librarySearch','languageFilter','topicFilter','statusFilter','likedFilter'])$(id).addEventListener(id==='librarySearch'?'input':'change',refresh);
  $('clearFilters').addEventListener('click',()=>{for(const id of ['librarySearch','languageFilter','topicFilter','statusFilter'])$(id).value='';$('likedFilter').checked=false;refresh();});
  return {refresh,setData(library){
    items=library.materials;index=library.index;
    const languages=[...new Set(items.map(item=>item.material.language))].sort();
    $('languageFilter').replaceChildren(new Option('Todos los idiomas',''),...languages.map(language=>new Option(new Intl.DisplayNames(['es'],{type:'language'}).of(language),language)));
    const used=new Set(index.materials.filter(m=>items.some(i=>i.material.id===m.id)).flatMap(m=>m.topics));
    $('topicFilter').replaceChildren(new Option('Todas las temáticas',''),...index.topics.filter(t=>used.has(t.id)).map(t=>new Option(t.label,t.id)));
    refresh();
  }};
}
