(() => {
  const preferences = window.MicrolearningPreferences;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = (value) => ['system', 'light', 'dark'].includes(value);
  let preference = preferences.get().theme;
  function applyTheme() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }
  // This script runs before the stylesheet and body to avoid a wrong-theme first paint.
  applyTheme();
  system.addEventListener('change', () => { if (preference === 'system') applyTheme(); });
  document.addEventListener('DOMContentLoaded', () => {
    if (location.protocol === 'file:') { document.getElementById('fileNotice').hidden = false; document.getElementById('loadMessage').textContent = ''; }
    const select = document.getElementById('themeSelect');
    select.value = preference;
    select.addEventListener('change', () => {
      preference = valid(select.value) ? select.value : 'system';
      applyTheme();
      if (!preferences.update({ theme: preference })) document.getElementById('storageMessage').textContent = 'No se puede guardar el tema; se conservará solo durante esta sesión.';
    });
  });
})();
