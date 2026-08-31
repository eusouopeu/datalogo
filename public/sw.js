// Service worker do shell do app: cacheia estático same-origin, deixa chamadas às APIs
// públicas (IBGE/BCB/SICONFI/Comex Stat) passarem direto pela rede — quem cacheia dados
// de série é o localStorage (ver src/lib/cache.ts), não o service worker.
const CACHE = 'datalogo-shell-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    // HTML: rede primeiro (pega deploys novos), cai pro cache se estiver offline.
    event.respondWith(
      fetch(request)
        .then((resposta) => {
          caches.open(CACHE).then((cache) => cache.put(request, resposta.clone()))
          return resposta
        })
        .catch(() => caches.match(request).then((r) => r ?? caches.match('./'))),
    )
    return
  }

  // Estático (JS/CSS/fontes/ícones): cache primeiro, revalida em segundo plano.
  event.respondWith(
    caches.match(request).then((cacheado) => {
      const buscaRede = fetch(request)
        .then((resposta) => {
          caches.open(CACHE).then((cache) => cache.put(request, resposta.clone()))
          return resposta
        })
        .catch(() => cacheado)
      return cacheado ?? buscaRede
    }),
  )
})
