// Cache files during install
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("crickscore-cache").then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./manifest.json",
        "./service-worker.js"
      ])
    )
  );
});

// Serve cached files on fetch
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

// 🔄 Listen for SKIP_WAITING message from app
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
