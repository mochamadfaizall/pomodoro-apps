const CACHE = "pixel-pomodoro-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./images/clawd.png",
  "./images/detektif.png",
  "./images/kopi.png",
  "./images/pop-cat.jpg",
  "./images/finn.png",
  "./images/banana-cat.png",
  "./images/spidey.png",
  "./images/spidey-swing.png",
  "./images/wizard.png",
  "./images/newt.png",
  "./images/scene.jpg",
  "./images/sky.jpg",
  "./images/park.jpg",
  "./images/mountain.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
