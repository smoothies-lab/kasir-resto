// Service worker Kasir Resto
// Strategi "jaringan dulu": selalu ambil file terbaru dari server,
// kalau internet putus baru pakai salinan yang tersimpan.
// Data pesanan/pembayaran (Supabase) TIDAK disimpan di sini — tetap butuh internet.

const NAMA_CACHE = 'kasir-resto-v1';
const FILE_INTI = [
  './',
  'index.html',
  'style.css',
  'config.js',
  'app.js',
  'manifest.json',
  'ikon/ikon-192.png',
  'ikon/ikon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(NAMA_CACHE).then((c) => c.addAll(FILE_INTI)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((semua) => Promise.all(semua.filter((n) => n !== NAMA_CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Hanya file aplikasi sendiri (bukan Supabase / CDN), dan hanya GET
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const salinan = res.clone();
          caches.open(NAMA_CACHE).then((c) => c.put(e.request, salinan));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./')))
  );
});
