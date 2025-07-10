const CACHE_NAME = 'zikr-i-zeynep-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/sounds/background.mp3',
  '/sounds/click.mp3',
  '/sounds/ses1.mp3',
  '/sounds/ses2.mp3',
  '/sounds/ses3.mp3',
  '/sounds/ses4.mp3',
  '/sounds/ses5.mp3',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Roboto:wght@300;400;500&display=swap',
  'https://fonts.googleapis.com/css2?family=Petit+Formal+Script&display=swap'
];

// Install event - cache kaynaklari
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Cache oluşturuldu');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - cache'den servis et
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // Cache'de varsa cache'den dön
        if (response) {
          return response;
        }

        // Cache'de yoksa network'ten al
        return fetch(event.request).then(
          function (response) {
            // Geçerli response kontrolü
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Response'u clone et (sadece bir kez kullanılabilir)
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function (cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      }
      )
  );
});

// Activate event - eski cache'leri temizle
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync - API calls için
self.addEventListener('sync', function (event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Offline durumda biriken API call'ları burada işle
  console.log('Background sync çalışıyor');
}

// Push notifications (gelecek için)
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.url
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
