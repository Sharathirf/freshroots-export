window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  window.__freshRootsInstallPrompt = event;
  window.dispatchEvent(new Event('freshroots:install-prompt-ready'));
});

window.addEventListener('appinstalled', () => {
  window.__freshRootsInstallPrompt = null;
  window.dispatchEvent(new Event('freshroots:app-installed'));
});
