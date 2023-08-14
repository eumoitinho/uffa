const CACHE_NAME = 'uffa_cache_2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/login',
  '/NewsIndex',
  '/EditProfile',
  '/Sidebar.jsx',
  '/SidebarItem.jsx',
  '/SidebarProfile.jsx',
  '/home',
  '/register',
  '/static/js/bundle.js/'
  // Inclua aqui todos os arquivos estáticos que você deseja armazenar em cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
