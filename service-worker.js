let cacheName = 'after_school-v1';
let cacheFiles = [
    'index.html',
    'js/main.js',
    'index.webmanifest',
    'images/R.png',
    'images/192x192.png',
    'images/Art.png',
    'images/Biology.jpg',
    'images/Chemistry.png',
    'images/Economics.jpg',
    'images/English.jpg',
    'images/Geography.png',
    'images/History.png',
    'images/math.png',
    'images/Music.png',
    'images/Physics.png'
]

self.addEventListener('install', (event) => {
    console.log('[Service worker] Install');
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('[Service worker] Caching all the files');
            return cache.addAll(cacheFiles);
        })
    )
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (r) {
            // Download the file if it is not in the cache,
            return r || fetch(event.request).then(function (response) {
                // add the new file to cache
                return caches.open(cacheName).then(function (cache) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});