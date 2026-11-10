/* Funzionamento senza rete: l'app resta installata e gioca contro i bot anche offline. */
const VERSION = 'tavolo-7faca20ae0';
const FILES = [
"./",
"app.css",
"art/avatars/alchimista.webp",
"art/avatars/bardo.webp",
"art/avatars/cacciatrice.webp",
"art/avatars/cavaliera.webp",
"art/avatars/fabbra.webp",
"art/avatars/fornaio.webp",
"art/avatars/giullara.webp",
"art/avatars/giullare.webp",
"art/avatars/maga-luce.webp",
"art/avatars/mago-fuoco.webp",
"art/avatars/mercante.webp",
"art/avatars/messaggera.webp",
"art/avatars/monella.webp",
"art/avatars/pescatore.webp",
"art/avatars/re.webp",
"art/avatars/regina.webp",
"art/cards/J1.webp",
"art/cards/J2.webp",
"art/cards/J3.webp",
"art/cards/J4.webp",
"art/cards/W1.webp",
"art/cards/W2.webp",
"art/cards/W3.webp",
"art/cards/W4.webp",
"art/cards/b1.webp",
"art/cards/b10.webp",
"art/cards/b11.webp",
"art/cards/b12.webp",
"art/cards/b13.webp",
"art/cards/b2.webp",
"art/cards/b3.webp",
"art/cards/b4.webp",
"art/cards/b5.webp",
"art/cards/b6.webp",
"art/cards/b7.webp",
"art/cards/b8.webp",
"art/cards/b9.webp",
"art/cards/g1.webp",
"art/cards/g10.webp",
"art/cards/g11.webp",
"art/cards/g12.webp",
"art/cards/g13.webp",
"art/cards/g2.webp",
"art/cards/g3.webp",
"art/cards/g4.webp",
"art/cards/g5.webp",
"art/cards/g6.webp",
"art/cards/g7.webp",
"art/cards/g8.webp",
"art/cards/g9.webp",
"art/cards/r1.webp",
"art/cards/r10.webp",
"art/cards/r11.webp",
"art/cards/r12.webp",
"art/cards/r13.webp",
"art/cards/r2.webp",
"art/cards/r3.webp",
"art/cards/r4.webp",
"art/cards/r5.webp",
"art/cards/r6.webp",
"art/cards/r7.webp",
"art/cards/r8.webp",
"art/cards/r9.webp",
"art/cards/y1.webp",
"art/cards/y10.webp",
"art/cards/y11.webp",
"art/cards/y12.webp",
"art/cards/y13.webp",
"art/cards/y2.webp",
"art/cards/y3.webp",
"art/cards/y4.webp",
"art/cards/y5.webp",
"art/cards/y6.webp",
"art/cards/y7.webp",
"art/cards/y8.webp",
"art/cards/y9.webp",
"art/ui/back.webp",
"art/ui/paper.webp",
"art/ui/wood.webp",
"fonts/Lora-Italic-Variable.ttf",
"fonts/Lora-Variable.ttf",
"icons/icon-180.png",
"icons/icon-192.png",
"icons/icon-32.png",
"icons/icon-512.png",
"icons/maskable-512.png",
"index.html",
"js/app.js",
"js/audio.js",
"js/cardface.js",
"js/config.js",
"js/engine.js",
"js/fx.js",
"js/net.js",
"js/profile.js",
"js/rules-data.js",
"manifest.webmanifest"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k.startsWith('tavolo-')).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
      /* la pagina prima dalla rete, così gli aggiornamenti arrivano subito */
      e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r; }).catch(() => caches.match('index.html', { ignoreSearch: true })));
      return;
    }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return r; })));
  } else if (/jsdelivr|unpkg/.test(url.host)) {
    e.respondWith(caches.open(VERSION).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })));
  }
});
