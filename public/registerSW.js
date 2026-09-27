if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('Sadhana PWA ServiceWorker active with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('Sadhana PWA ServiceWorker registration error:', err);
      });
  });
}
