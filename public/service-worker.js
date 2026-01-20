const SHELL_CACHE_NAME = 'wheel-of-words-shell-v1.3';
const RUNTIME_CACHE_NAME = 'wheel-of-words-runtime-v1.3';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

const STATIC_EXTENSIONS = /\.(?:js|css|json|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|ttf|otf|mp3|wav|ogg|webm)$/i;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== SHELL_CACHE_NAME && name !== RUNTIME_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  const assetPath = url.pathname;
  const isBuildAsset = assetPath.includes('/assets/');
  const isStaticResource = STATIC_EXTENSIONS.test(assetPath);

  if (isBuildAsset || isStaticResource) {
    event.respondWith(cacheFirst(request));
  }
});

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(SHELL_CACHE_NAME);
      await cache.put('./index.html', networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(SHELL_CACHE_NAME);
    const cachedResponse = await cache.match('./index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return cachedResponse;
  }
}
