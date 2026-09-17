// Service Worker للعمل بدون اتصال والتخزين المؤقت - healx app
const CACHE_NAME = 'healx-app-v1.0.10'; 

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

// 1. التثبيت: حفظ الملفات الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] تم فتح الـ Cache وتخزين الملفات الأساسية');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[SW] خطأ في التخزين المؤقت الأولي:', err))
  );
  // تم إزالة self.skipWaiting() من هنا ليعمل زر التحديث في النافذة بشكل صحيح
});

// 2. التفعيل: حذف النسخ القديمة والسيطرة على العملاء
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] حذف الـ Cache القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. استراتيجية جلب البيانات (Fetch)
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;

  const request = event.request;
  const url = request.url;
  // --- الحالة الأولى: طلبات الاختبارات والبيانات (Network First) ---
  if (url.includes('test') || url.includes('.json') || url.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (event.request.method === 'GET' && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(async () => {
          // محاولة جلب النسخة المخزنة
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          
          // في حال عدم وجود شبكة وعدم وجود كاش سابق، إرجاع استجابة JSON بديلة تفادياً للانهيار
          return new Response(JSON.stringify({ error: true, message: "Offline and no cache" }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
  } 
  
  // --- الحالة الثانية: الملفات الثابتة (Cache First) ---
  else {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then(fetchResponse => {
          // التحقق من صحة الاستجابة ودعم الـ CORS/Opaque Responses (status === 0)
          if (!fetchResponse || (fetchResponse.status !== 200 && fetchResponse.status !== 0)) {
            return fetchResponse;
          }

          // حفظ الملفات الديناميكية الجديدة للـ GET Requests فقط
          if (request.method === 'GET') {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
          }

          return fetchResponse;
        });
      }).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
    );
  }
});

// 4. استقبال رسالة التحديث المباشر من الواجهة
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
