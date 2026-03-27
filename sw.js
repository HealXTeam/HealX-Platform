// Service Worker للعمل بدون اتصال والتخزين المؤقت - نسخة مطورة لتحديث الاختبارات
const CACHE_NAME = 'healx-app-v1.0.4'; 

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

// التثبيت: حفظ الملفات الأساسية في الذاكرة
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الـ Cache وتخزين الملفات الأساسية');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('خطأ في التخزين المؤقت الأولي:', err);
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

// التنظيف: حذف نسخ التخزين القديمة
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('حذف الـ Cache القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// الاستراتيجية الذكية لجلب البيانات (Fetch)
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير HTTP/HTTPS (مثل طلبات chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  const url = event.request.url;

  // --- الحالة الأولى: طلبات الاختبارات والبيانات (JSON أو Google Script) ---
  // نستخدم هنا استراتيجية "الشبكة أولاً" لضمان الحصول على أحدث هيكل اختبارات
  if (url.includes('test') || url.includes('.json') || url.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // إذا نجح الاتصال، نقوم بتحديث النسخة المخزنة لدينا بالجديد
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // إذا فشل الاتصال (أوفلاين)، نبحث عن النسخة المخزنة سابقاً
          return caches.match(event.request);
        })
    );
  } 
  
  // --- الحالة الثانية: الملفات الثابتة (صور، تنسيق، سكريبتات البرنامج) ---
  // نستخدم استراتيجية "التخزين أولاً" لسرعة استجابة التطبيق
  else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            // تخزين الملفات التي لم تكن موجودة في القائمة الأولية
            if (!fetchResponse || fetchResponse.status !== 200) return fetchResponse;
            
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return fetchResponse;
          });
        }).catch(() => {
          // في حالة الفشل التام، العودة للصفحة الرئيسية
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        })
    );
  }
});

// الاستماع لرسالة التحديث لتفعيل النسخة الجديدة فوراً
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
