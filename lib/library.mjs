import { fail, MATERIAL_ID } from './content.mjs';
const EMPTY = () => ({ indexVersion:1, topics:[], materials:[] });
export function validateLibraryIndex(index, knownIds) {
  if (index === null) return EMPTY();
  if (!index || index.indexVersion !== 1 || !Array.isArray(index.topics) || !Array.isArray(index.materials)) fail('library.json','$','índice de biblioteca incompatible');
  const topics = new Set(), ids = new Set();
  if (Object.keys(index).some(k=>!['indexVersion','topics','materials'].includes(k))) fail('library.json','$','campo no permitido');
  for (const topic of index.topics) {
    if (!topic || typeof topic.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.id) || typeof topic.label !== 'string' || !topic.label.trim() || topics.has(topic.id) || Object.keys(topic).some(k=>!['id','label'].includes(k))) fail('library.json','topics','temática inválida o duplicada');
    topics.add(topic.id);
  }
  for (const item of index.materials) {
    if (!item || !MATERIAL_ID.test(item.id) || (knownIds && !knownIds.has(item.id)) || ids.has(item.id)) fail('library.json','materials.id','material inexistente o duplicado');
    ids.add(item.id);
    if (Object.keys(item).some(k=>!['id','topics','tags','editorialStatus'].includes(k))) fail('library.json',item.id,'campo no permitido');
    if (!Array.isArray(item.topics) || item.topics.some(t=>!topics.has(t)) || new Set(item.topics).size!==item.topics.length) fail('library.json',item.id+'.topics','temáticas no normalizadas');
    if (!Array.isArray(item.tags) || item.tags.some(t=>typeof t!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t)) || new Set(item.tags).size!==item.tags.length) fail('library.json',item.id+'.tags','etiquetas inválidas');
    if (!['provisional','approved'].includes(item.editorialStatus)) fail('library.json',item.id+'.editorialStatus','estado editorial inválido');
  }
  return index;
}
export function normalizeSearch(text) { return text.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('es').trim().replace(/\s+/g,' '); }
export function libraryEntry(item, index, state) {
  const {material,source,lessons,stats} = item.bundle;
  const metadata = index.materials.find(m=>m.id===material.id);
  const completed = lessons.filter(l=>state.completed.has(l.id)).length;
  return { id:material.id,title:material.title,officialTitle:source.officialTitle,author:source.author.name,language:material.language,lessonCount:lessons.length,selectedDurationSeconds:stats.selectedSeconds,priorityDurationSeconds:stats.prioritySeconds,topics:metadata?.topics || [],tags:metadata?.tags || [],lessons,completed,liked:lessons.some(l=>state.likes.has(l.id)),status:completed===0?'not-started':completed===lessons.length?'completed':'in-progress' };
}
export function filterLibrary(entries, { query='', language='', topic='', status='', liked=false } = {}) {
  const search = normalizeSearch(query);
  return entries.flatMap(entry=>{
    if ((language&&entry.language!==language)||(topic&&!entry.topics.includes(topic))||(status&&entry.status!==status)||(liked&&!entry.liked)) return [];
    const matchingLessons = search ? entry.lessons.filter(l=>normalizeSearch(l.title).includes(search)) : [];
    const match = !search || [entry.title,entry.officialTitle,entry.author].some(t=>normalizeSearch(t).includes(search));
    return match || matchingLessons.length ? [{...entry,matchingLessons}] : [];
  });
}
