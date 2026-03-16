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
    navigationStack: []
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    //لضمان أن الصفحة الرئيسية هي نقطة البداية في المتصفح
    history.replaceState({page: 'home'}, null, "");
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