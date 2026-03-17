// Service Worker للعمل بدون اتصال والتخزين المؤقت

const CACHE_NAME = 'healx-app-v1.0.2'; // تحديث الإصدار للتحديث التلقائي
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './css/responsive.css',
  './js/app.js',
  './js/navigation.js',
  './js/test.js',
  './js/support.js',
  './images/healx-logo.png',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// التثبيت
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الـ Cache');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('خطأ في التخزين المؤقت:', err);
          // العودة بدون خطأ حتى لا نمنع تثبيت Service Worker
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

// التنظيف
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الـ Cache القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// جلب البيانات
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كانت البيانات مخزنة مؤقتاً، أرجعها
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // تحقق من الاستجابة
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // نسخ الاستجابة للتخزين المؤقت
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // في حالة الفشل، حاول إرجاع صفحة محفوظة مؤقتاً
          return caches.match('./index.html')
            .then(response => response || new Response('لا يمكن الوصول إلى المورد'))
            .catch(() => new Response('خطأ في الاتصال'));
        });
      })
  );
});

// استقبال الرسائل
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
