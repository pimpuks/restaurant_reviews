const CACHE_VERSION = '1';
const STATIC_CACHE = `restaurant-reviews-cache-v${CACHE_VERSION}`;

self.addEventListener('install', event => {
  let urlsToCache = [
    './index.html',
    './restaurant.html',
    './serviceworker.js',
    './js/main.js',
    './js/restaurant_info.js',
    './js/dbhelper.js',
    './data/restaurants.json',
    './css/styles.css',
    './img/1.jpg',
    './img/2.jpg',
    './img/3.jpg',
    './img/4.jpg',
    './img/5.jpg',
    './img/6.jpg',
    './img/7.jpg',
    './img/8.jpg',
    './img/9.jpg',
    './img/10.jpg',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
    'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1205/1539.jpg70?access_token=pk.eyJ1IjoicGltcHVrcyIsImEiOiJjanltajR1cncwanF3M2lzOHJlbW54cTF3In0.BEqfumdmKy4IpCn1sA-xHw',
    'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1205/1540.jpg70?access_token=pk.eyJ1IjoicGltcHVrcyIsImEiOiJjanltajR1cncwanF3M2lzOHJlbW54cTF3In0.BEqfumdmKy4IpCn1sA-xHw'
  ];
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return (
        resp ||
        fetch(event.request)
          .then(response => {
            return caches.open(STATIC_CACHE).then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(response => {
            console.log('Exception in fetch ', response);
          })
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return (
              cacheName.startsWith('restaurant-reviews-cache-') &&
              cacheName != STATIC_CACHE
            );
          })
          .map(cacheName => {
            return cache.delete(cacheName);
          })
      );
    })
  );
});
