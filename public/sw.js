const SHELL_CACHE = 'despesas-shell-v1'
const STATIC_CACHE = 'despesas-static-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith('despesas-') &&
              cacheName !== SHELL_CACHE &&
              cacheName !== STATIC_CACHE,
          )
          .map((cacheName) => caches.delete(cacheName)),
      ),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          if (response.ok) {
            const cache = await caches.open(SHELL_CACHE)
            await cache.put('/', response.clone())
          }
          return response
        } catch {
          const cachedPage = await caches.match('/')
          if (cachedPage) return cachedPage
          return Response.error()
        }
      })(),
    )
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cachedAsset = await cache.match(request)
        if (cachedAsset) return cachedAsset

        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      }),
    )
  }
})
