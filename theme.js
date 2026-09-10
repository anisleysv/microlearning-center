(() => {
  const key = 'ia58-theme-v1';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = (value) => ['system', 'light', 'dark'].includes(value);
  let preference = 'system';
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) preference = saved;
  } catch { /* Unavailable storage falls back to the system preference. */ }
  function applyTheme() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }
  // This script runs before the stylesheet and body to avoid a wrong-theme first paint.
  applyTheme();
  system.addEventListener('change', () => { if (preference === 'system') applyTheme(); });
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('themeSelect');
    select.value = preference;
    select.addEventListener('change', () => {
      preference = valid(select.value) ? select.value : 'system';
      applyTheme();
      try { localStorage.setItem(key, preference); }
      catch { document.getElementById('statusMessage').textContent = 'No se puede guardar el tema; se conservará solo durante esta sesión.'; }
    });
  });
})();
