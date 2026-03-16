// اسم الـ Cache
const CACHE_NAME = 'healx-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './css/responsive.css',
    './js/app.js',
    './js/navigation.js',
    './js/test.js',
    './js/support.js',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// تثبيت Service Worker والبدء بالـ Cache
self.addEventListener('install', event => {
    console.log('🔧 Service Worker يتم تثبيته...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('💾 تم فتح Cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.log('❌ خطأ في التخزين المؤقت:', err))
    );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
    console.log('✅ Service Worker تم تفعيله');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ حذف Cache القديم:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
    // تجاهل الطلبات غير الصحيحة
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // للطلبات GET
    if (event.request.method === 'GET') {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // إذا كان الـ Response موجود في Cache، أرجعه
                    if (response) {
                        return response;
                    }

                    // وإلا، جرب الحصول عليه من الشبكة
                    return fetch(event.request).then(response => {
                        // تحقق من أن الـ Response صالح
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // نسخ الـ Response وأضفه إلى Cache
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                        return response;
                    }).catch(() => {
                        // إذا فشل الاتصال بالشبكة، أرجع صفحة أوفلاين
                        return caches.match(event.request)
                            .then(response => response || new Response('تعذر تحميل الصفحة'));
                    });
                })
        );
    }

    // للطلبات POST (الإحصائيات وغيرها)
    if (event.request.method === 'POST') {
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(err => {
                    // حفظ البيانات للإرسال لاحقاً
                    return savePendingRequest(event.request);
                })
        );
    }
});

// حفظ الطلبات المعلقة
async function savePendingRequest(request) {
    try {
        const db = await openIndexedDB();
        const data = await request.json();
        
        db.transaction(['pendingRequests'], 'readwrite')
            .objectStore('pendingRequests')
            .add({
                url: request.url,
                data: data,
                timestamp: Date.now()
            });

        return new Response(JSON.stringify({ offline: true, message: 'سيتم الإرسال عند الاتصال بالإنترنت' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'خطأ في الحفظ' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// فتح IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('HealXDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pendingRequests')) {
                db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('cachedTests')) {
                db.createObjectStore('cachedTests', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('testResults')) {
                db.createObjectStore('testResults', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// معالجة الرسائل من الـ Client
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SYNC_PENDING_REQUESTS') {
        syncPendingRequests();
    }
});

// مزامنة الطلبات المعلقة
async function syncPendingRequests() {
    try {
        const db = await openIndexedDB();
        const requests = db.transaction(['pendingRequests'], 'readonly')
            .objectStore('pendingRequests')
            .getAll();

        requests.onsuccess = () => {
            const pendingRequests = requests.result;
            pendingRequests.forEach(async (req, index) => {
                try {
                    await fetch(req.url, {
                        method: 'POST',
                        body: JSON.stringify(req.data),
                        headers: { 'Content-Type': 'application/json' }
                    });

                    // حذف الطلب بعد الإرسال الناجح
                    db.transaction(['pendingRequests'], 'readwrite')
                        .objectStore('pendingRequests')
                        .delete(req.id);
                } catch (error) {
                    console.log('تعذر إرسال الطلب:', error);
                }
            });
        };
    } catch (error) {
        console.log('خطأ في المزامنة:', error);
    }
}
