self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== 'my-cache-name') {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Clear cookies (optional)
      // You can use the `cookies` API for this if you need to clear specific cookies
    })
  );
});
