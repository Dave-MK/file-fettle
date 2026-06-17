const CACHE = "filefettle-v1";

// App shell assets to pre-cache on install
const PRECACHE = ["/"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
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

  // Never intercept: API routes, HMR, Chrome extension requests
  if (
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.protocol === "chrome-extension:" ||
    e.request.method !== "GET"
  ) return;

  // Network-first for Next.js build assets (always fresh in dev, hashed in prod)
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for same-origin navigation + static assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      });
      return cached ?? network;
    })
  );
});
