console.log('Service worker is online', self || null);
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `restaurant-reviews-cache-${CACHE_VERSION}`;

self.addEventListener('install', event => {
  let urlsToCache = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/serviceworker.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/js/dbhelper.js',
    '/data/restaurants.json',
    '/css/styles.css',
    '/img/',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png'
  ];
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log(`adding URLs to cache ${STATIC_CACHE}`);
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return (
        resp ||
        fetch(event.request).then(response => {
          return caches.open(STATIC_CACHE).then(cache => {
            console.log('store response from fetch to cache');
            console.log(event.request);
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});
