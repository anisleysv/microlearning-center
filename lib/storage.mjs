const LEGACY_MATERIAL = 'youtube-S6up3AnyARo';
// Explicit migration mapping: presentation order must never determine identity.
const LEGACY_IDS = Object.freeze({
  1:'youtube-S6up3AnyARo-lesson-01', 2:'youtube-S6up3AnyARo-lesson-02', 3:'youtube-S6up3AnyARo-lesson-03',
  4:'youtube-S6up3AnyARo-lesson-04', 5:'youtube-S6up3AnyARo-lesson-05', 6:'youtube-S6up3AnyARo-lesson-06',
  7:'youtube-S6up3AnyARo-lesson-07', 8:'youtube-S6up3AnyARo-lesson-08', 9:'youtube-S6up3AnyARo-lesson-09',
  10:'youtube-S6up3AnyARo-lesson-10', 11:'youtube-S6up3AnyARo-lesson-11', 12:'youtube-S6up3AnyARo-lesson-12',
  13:'youtube-S6up3AnyARo-lesson-13', 14:'youtube-S6up3AnyARo-lesson-14', 15:'youtube-S6up3AnyARo-lesson-15'
});
export function createStateStore(getStorage = () => localStorage) {
  const memory = new Map();
  const key = id => 'microlearning-center:state:v2:' + id;
  function decode(raw) { try { return JSON.parse(raw); } catch { return null; } }
  function persist(id, state) {
    memory.set(id,state);
    try { getStorage().setItem(key(id),JSON.stringify({ storageVersion:2, completedLessonIds:[...state.completed], likedLessonIds:[...state.likes] })); return true; }
    catch { return false; }
  }
  function load(id, lessons) {
    if (memory.has(id)) return memory.get(id);
    const ids = new Set(lessons.map(l=>l.id));
    const filter = value => new Set(Array.isArray(value) ? value.filter(x=>typeof x === 'string' && ids.has(x)) : []);
    let state = { completed:new Set(), likes:new Set(), persistent:true };
    try {
      const storage = getStorage(), raw = storage.getItem(key(id));
      if (raw !== null) {
        const value = decode(raw);
        if (value?.storageVersion === 2) state = { completed:filter(value.completedLessonIds), likes:filter(value.likedLessonIds), persistent:true };
      } else {
        if (id === LEGACY_MATERIAL) {
          const legacy = name => { const list = decode(storage.getItem(name)); return Array.isArray(list) ? list.filter(Number.isInteger).map(n=>LEGACY_IDS[n]) : []; };
          state.completed = filter(legacy('ia58-progress-v1')); state.likes = filter(legacy('ia58-favorites-v1'));
        }
        // A persisted empty state also prevents reimport after a voluntary reset.
        state.persistent = persist(id,state);
      }
    } catch { state.persistent = false; }
    memory.set(id,state); return state;
  }
  return { load, save: persist };
}
