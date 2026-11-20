// Offline support: keep the app, the mushaf text and the fonts on the device.
// Bump VERSION whenever index.html or the data files change, so phones pick up the new version.
const VERSION = "v8-2026-11-20";
const CORE = ["./", "index.html", "qaloon.json", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open("core-" + VERSION).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("core-") && k !== "core-" + VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // accounts and data always go to the network (the app keeps its own copy for offline use)
  if (url.hostname.endsWith("supabase.co")) return;
  // the page itself: newest version when online, saved copy when offline
  if (req.mode === "navigate" || (url.origin === location.origin && url.pathname.endsWith("/index.html"))) {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open("core-" + VERSION).then(c => c.put("index.html", cp)); return r; })
      .catch(() => caches.match("index.html").then(r => r || caches.match("./"))));
    return;
  }
  // mushaf text, icons, library, fonts: saved copy first, refreshed in the background
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) { const cp = r.clone(); caches.open(url.origin === location.origin ? "core-" + VERSION : "ext").then(c => c.put(req, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
