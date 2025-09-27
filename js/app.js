// إعدادات التطبيق
const CONFIG = {
    API_BASE: 'https://script.google.com/macros/s/AKfycbxiHdlDznr2N1w0qX3AGJqIsf1gS8xAJPx0VVTScf7wyIWm_2_VkSGq5JMGdV-WqdQl/exec',
    SUPPORT_EMAIL: 'healxteam@gmail.com',
    DEFAULT_TIMER_SECONDS: 600,
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
    navigationStack: []
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تعيين سنة حقوق النشر
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
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
        showAlert('خطأ في الاتصال', 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    }
}

// عرض تنبيه
function showAlert(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('alert-modal').style.display = 'flex';
}

// جعل الدوال متاحة عالمياً
window.CONFIG = CONFIG;
window.appState = appState;
window.showAlert = showAlert;
window.loadTestStructure = loadTestStructure;
