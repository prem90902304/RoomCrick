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

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
// Listen for SKIP_WAITING message from page
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

