(() => {
  const key = 'microlearning-center:preferences:v2';
  const speeds = [1, 1.25, 1.5, 1.75, 2];
  const themes = ['system', 'light', 'dark'];
  const defaults = { storageVersion: 2, theme: 'system', playbackSpeed: 1.5 };
  const normalize = value => ({ ...defaults, theme: themes.includes(value?.theme) ? value.theme : defaults.theme, playbackSpeed: speeds.includes(value?.playbackSpeed) ? value.playbackSpeed : defaults.playbackSpeed });
  let memory = { ...defaults }, available = true;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try { const value = JSON.parse(saved); if (value.storageVersion === 2) memory = normalize(value); } catch { /* Never reimport legacy data over an existing v2 value. */ }
    } else {
      memory = normalize({ theme: localStorage.getItem('ia58-theme-v1'), playbackSpeed: Number(localStorage.getItem('ia58-speed-v1')) });
      // The successfully written v2 record is the migration marker; legacy keys remain intact.
      localStorage.setItem(key, JSON.stringify(memory));
    }
  } catch { available = false; }
  window.MicrolearningPreferences = {
    get: () => ({ ...memory }),
    available: () => available,
    update(patch) {
      // Merge with current persisted preferences to avoid clobbering theme or speed.
      try { const current = JSON.parse(localStorage.getItem(key)); if (current?.storageVersion === 2) memory = normalize(current); } catch { /* Use session memory when storage is unavailable. */ }
      memory = normalize({ ...memory, ...patch });
      try { localStorage.setItem(key, JSON.stringify(memory)); available = true; return true; }
      catch { available = false; return false; }
    }
  };
})();
