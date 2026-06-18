const CACHE = "filefettle-v2";

self.addEventListener("install", e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Never intercept: navigation, HMR, cross-origin, non-GET
  // Navigation must go to network so COOP/COEP headers are always present
  // (required for cross-origin-isolated / SharedArrayBuffer / FFmpeg WASM)
  if (
    e.request.mode === "navigate" ||
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.protocol === "chrome-extension:" ||
    url.origin !== self.location.origin ||
    e.request.method !== "GET"
  ) return;

  // Cache-first for hashed Next.js static assets (_next/static/**)
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(e.request).then(cached => cached ||
        fetch(e.request).then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Network-first for everything else (public assets, manifest, icons)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
