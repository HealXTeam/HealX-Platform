// إعدادات التطبيق
const CONFIG = {
    API_BASE: 'https://script.google.com/macros/s/AKfycbxQGT4ciiniFvr-Ro_X1dBDPca6YKGiAReOe-f0yoENARMtsTpRmZ97_mKvk1U4o2Hr/exec',
    SUPPORT_EMAIL: 'healxteam@gmail.com',
    DEFAULT_TIMER_SECONDS: 3600,
};

// حالة التطبيق
let appState = {
    currentPage: 'home',
    currentTest: null,
    questions: [],
    answers: {},
    currentQuestionIndex: 0,
    timerInterval: null,
    timeLeft: 0,
    testStructure: null,
    navigationStack: [],
    testMode: null // 'practice' أو 'exam'
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    //لضمان أن الصفحة الرئيسية هي نقطة البداية في المتصفح
    history.replaceState({page: 'home'}, null, "");
    // تعيين سنة حقوق النشر
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // تسجيل الزيارة وتهيئة قاعدة البيانات
    recordVisitorCount();
    initializeIndexedDB();
    
    // عرض الشاشة التمهيدية لمدة 3 ثوان
    setTimeout(() => {
        document.getElementById('intro-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('intro-screen').style.display = 'none';
            document.querySelector('.main-content').style.display = 'block';
            // تحميل هيكل الاختبارات بعد انتهاء الشاشة التمهيدية
            loadTestStructure();
        }, 1000);
    }, 3000);
});

// تحميل هيكل الاختبارات من API
async function loadTestStructure() {
    try {
        // التحقق من البيانات المحفوظة أولاً
        const cachedData = getCachedTestStructure();
        if (cachedData) {
            appState.testStructure = cachedData;
            if (appState.currentPage === 'tests') {
                renderTestsPage();
            }
            updateTestsStatusUI();
            return;
        }
        
        // إذا لم تكن هناك بيانات محفوظة، تحميل من API
        const response = await fetch(CONFIG.API_BASE + '?action=getStructure');
        const data = await response.json();
        
        if (data.success) {
            appState.testStructure = data.structure;
            if (appState.currentPage === 'tests') {
                renderTestsPage();
            }
        } else {
            showAlert('خطأ في تحميل هيكل الاختبارات', data.message || 'خطأ غير معروف');
        }
    } catch (error) {
        // محاولة تحميل البيانات المحفوظة في حالة فشل الاتصال
        const cachedData = getCachedTestStructure();
        if (cachedData) {
            appState.testStructure = cachedData;
            if (appState.currentPage === 'tests') {
                renderTestsPage();
            }
            showAlert('وضع بدون اتصال', 'تم تحميل البيانات المحفوظة مسبقاً');
            updateTestsStatusUI();
        } else {
            showAlert('خطأ في الاتصال', 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
        }
    }
}

// ============ نظام حفظ واسترجاع الاختبارات ============

// حفظ هيكل الاختبارات في localStorage
function saveTestStructureToStorage(structure) {
    const storageData = {
        structure: structure,
        timestamp: Date.now(),
        dateString: new Date().toLocaleString('ar-SA')
    };
    localStorage.setItem('healx_cached_structure', JSON.stringify(storageData));
    return storageData;
}

// استرجاع هيكل الاختبارات من localStorage
function getCachedTestStructure() {
    try {
        const cached = localStorage.getItem('healx_cached_structure');
        if (cached) {
            const data = JSON.parse(cached);
            return data.structure;
        }
    } catch (error) {
        console.error('❌ خطأ في استرجاع البيانات المحفوظة:', error);
    }
    return null;
}

// الحصول على معلومات البيانات المحفوظة
function getCachedTestsInfo() {
    try {
        const cached = localStorage.getItem('healx_cached_structure');
        if (cached) {
            const data = JSON.parse(cached);
            return {
                timestamp: data.timestamp,
                dateString: data.dateString,
                isCached: true
            };
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
    }
    return { isCached: false };
}

// تحديث حالة واجهة المستخدم لعرض معلومات البيانات المحفوظة
function updateTestsStatusUI() {
    const statusElement = document.getElementById('tests-status');
    if (!statusElement) return;
    
    const info = getCachedTestsInfo();
    if (info.isCached) {
        statusElement.innerHTML = ` آخر تحديث: ${info.dateString}`;
        statusElement.style.color = 'var(--success-color)';
    } else {
        statusElement.innerHTML = 'لم يتم تحميل الاختبارات بعد';
        statusElement.style.color = 'var(--text-secondary)';
    }
}

// مزامنة الاختبارات من API وحفظها
async function syncTestsFromAPI() {
    const syncBtn = document.getElementById('sync-tests-btn');
    const originalText = syncBtn.innerHTML;
    
    try {
        syncBtn.disabled = true;
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ التحميل...';
        
        const response = await fetch(CONFIG.API_BASE + '?action=getStructure');
        const data = await response.json();
        
        if (data.success) {
            // حفظ البيانات في localStorage
            const storageData = saveTestStructureToStorage(data.structure);
            
            // تحديث حالة التطبيق
            appState.testStructure = data.structure;
            
            // تحديث الواجهة
            updateTestsStatusUI();
            renderTestsPage();
            
            // عرض رسالة نجاح
            showAlert('✅ تم بنجاح', `تم تحميل وحفظ الاختبارات\n${storageData.dateString}`);
        } else {
            showAlert('❌ خطأ', data.message || 'فشل تحميل الاختبارات');
        }
    } catch (error) {
        console.error('خطأ في المزامنة:', error);
        showAlert('❌ خطأ في الاتصال', 'تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
    } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = originalText;
    }
}

// حذف البيانات المحفوظة
function clearCachedTests() {
    localStorage.removeItem('healx_cached_structure');
    updateTestsStatusUI();
    showAlert('تم بنجاح', 'تم حذف البيانات المحفوظة');
}

// ============ نظام حفظ واسترجاع حالة الاختبار الحالي ============

// حفظ حالة الاختبار الكاملة (الأسئلة + الإجابات + التقدم + الوقت)
function saveTestProgress() {
    const progressData = {
        currentTest: appState.currentTest,
        questions: appState.questions,
        answers: appState.answers,
        testMode: appState.testMode,
        timeLeft: appState.timeLeft,
        timestamp: Date.now(),
        dateString: new Date().toLocaleString('ar-SA')
    };
    
    localStorage.setItem('healx_active_test', JSON.stringify(progressData));
    console.log('💾 تم حفظ حالة الاختبار الحالي');
}

// استرجاع حالة الاختبار الكاملة
function loadTestProgress() {
    try {
        const saved = localStorage.getItem('healx_active_test');
        if (saved) {
            const data = JSON.parse(saved);
            return data;
        }
    } catch (error) {
        console.error('❌ خطأ في استرجاع حالة الاختبار:', error);
    }
    return null;
}

// حفظ الإجابة الفردية
function saveAnswer(questionIndex, answer) {
    appState.answers[questionIndex] = answer;
    // حفظ التقدم في كل إجابة
    saveTestProgress();
}

// التحقق من وجود اختبار قيد التقدم
function hasActiveTest() {
    return localStorage.getItem('healx_active_test') !== null;
}

// الحصول على معلومات الاختبار النشط
function getActiveTestInfo() {
    const progress = loadTestProgress();
    if (progress) {
        return {
            testName: `${progress.currentTest.subject} - ${progress.currentTest.unitName}`,
            testMode: progress.testMode,
            savedAt: progress.dateString,
            answeredCount: Object.keys(progress.answers).length,
            totalCount: progress.questions.length
        };
    }
    return null;
}

// حذف حالة الاختبار (عند الإنهاء)
function clearTestProgress() {
    localStorage.removeItem('healx_active_test');
    console.log('🗑️ تم مسح حالة الاختبار');
}

// عرض تنبيه
function showAlert(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('alert-modal').style.display = 'flex';
}

// ============ نظام PWA والإحصائيات ============

// عداد الزيارات
function recordVisitorCount() {
    let db;
    const request = indexedDB.open('HealXDB', 1);
    
    request.onerror = () => console.log('خطأ في فتح قاعدة البيانات');
    request.onsuccess = () => {
        db = request.result;
        const transaction = db.transaction(['visitors'], 'readwrite');
        const store = transaction.objectStore('visitors');
        
        // الامتناع على الزيارة الأخيرة
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();
        
        if (lastVisit !== today) {
            // تسجيل زيارة جديدة
            const visitor = {
                date: new Date().toLocaleString('ar-SA'),
                timestamp: Date.now()
            };
            store.add(visitor);
            localStorage.setItem('lastVisit', today);
        }
        
        // عرض عدد الزيارات
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
            const count = getAllRequest.result.length;
            const badge = document.querySelector('[data-visitor-count]');
            if (badge) {
                badge.textContent = count;
            }
        };
    };
    
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('visitors')) {
            db.createObjectStore('visitors', { keyPath: 'id', autoIncrement: true });
        }
    };
}

// تهيئة IndexedDB
function initializeIndexedDB() {
    const request = indexedDB.open('HealXDB', 1);
    
    request.onerror = () => console.log('❌ خطأ في تهيئة قاعدة البيانات');
    
    request.onsuccess = () => {
        console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
    };
    
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // جدول الزيارات
        if (!db.objectStoreNames.contains('visitors')) {
            db.createObjectStore('visitors', { keyPath: 'id', autoIncrement: true });
        }
        
        // جدول الاختبارات المحفوظة
        if (!db.objectStoreNames.contains('cachedTests')) {
            db.createObjectStore('cachedTests', { keyPath: 'id' });
        }
        
        // جدول النتائج
        if (!db.objectStoreNames.contains('testResults')) {
            db.createObjectStore('testResults', { keyPath: 'id', autoIncrement: true });
        }
        
        // جدول الطلبات المعلقة
        if (!db.objectStoreNames.contains('pendingRequests')) {
            db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
        }
        
        console.log('✅ تم إنشاء جداول قاعدة البيانات');
    };
}

// حفظ الاختبار في قاعدة البيانات
function cacheTest(testId, testData) {
    const request = indexedDB.open('HealXDB', 1);
    
    request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cachedTests'], 'readwrite');
        const store = transaction.objectStore('cachedTests');
        
        store.put({
            id: testId,
            data: testData,
            timestamp: Date.now()
        });
        
        console.log('💾 تم حفظ الاختبار بنجاح:', testId);
    };
}

// جلب الاختبار من قاعدة البيانات
function getCachedTest(testId) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('HealXDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['cachedTests'], 'readonly');
            const store = transaction.objectStore('cachedTests');
            
            const getRequest = store.get(testId);
            getRequest.onsuccess = () => {
                resolve(getRequest.result);
            };
            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        };
    });
}

// حفظ نتيجة الاختبار
function saveTestResult(result) {
    const request = indexedDB.open('HealXDB', 1);
    
    request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['testResults'], 'readwrite');
        const store = transaction.objectStore('testResults');
        
        store.add({
            testName: result.testName,
            score: result.score,
            totalQuestions: result.totalQuestions,
            percentage: result.percentage,
            mode: result.mode,
            timestamp: new Date().toLocaleString('ar-SA')
        });
        
        console.log('💾 تم حفظ النتيجة بنجاح');
    };
}

// جعل الدوال متاحة عالمياً
window.CONFIG = CONFIG;
window.appState = appState;
window.showAlert = showAlert;
window.loadTestStructure = loadTestStructure;
window.recordVisitorCount = recordVisitorCount;
window.initializeIndexedDB = initializeIndexedDB;
window.cacheTest = cacheTest;
window.getCachedTest = getCachedTest;
window.saveTestResult = saveTestResult;
window.saveTestStructureToStorage = saveTestStructureToStorage;
window.getCachedTestStructure = getCachedTestStructure;
window.getCachedTestsInfo = getCachedTestsInfo;
window.updateTestsStatusUI = updateTestsStatusUI;
window.syncTestsFromAPI = syncTestsFromAPI;
window.clearCachedTests = clearCachedTests;
window.saveTestProgress = saveTestProgress;
window.loadTestProgress = loadTestProgress;
window.saveAnswer = saveAnswer;
window.hasActiveTest = hasActiveTest;
window.getActiveTestInfo = getActiveTestInfo;
window.clearTestProgress = clearTestProgress;


const toggle = document.getElementById("theme-toggle")
const icon = toggle.querySelector("i")

toggle.onclick = () => {

document.body.classList.toggle("dark-mode")

if(document.body.classList.contains("dark-mode")){

localStorage.setItem("theme","dark")

icon.classList.remove("fa-moon")
icon.classList.add("fa-sun")

}else{

localStorage.setItem("theme","light")

icon.classList.remove("fa-sun")
icon.classList.add("fa-moon")

}

}

if(localStorage.getItem("theme") === "dark"){

document.body.classList.add("dark-mode")

icon.classList.remove("fa-moon")
icon.classList.add("fa-sun")

}

if(window.matchMedia("(prefers-color-scheme: dark)").matches){

document.body.classList.add("dark-mode")

}
