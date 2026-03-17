// إعدادات التطبيق
const CONFIG = {
    API_BASE: 'https://script.google.com/macros/s/AKfycbxQGT4ciiniFvr-Ro_X1dBDPca6YKGiAReOe-f0yoENARMtsTpRmZ97_mKvk1U4o2Hr/exec',
    SUPPORT_EMAIL: 'healxteam@gmail.com',
    DEFAULT_TIMER_SECONDS: 3600,
};

// PWA Enhancement
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // يمكن إظهار زر التثبيت هنا إذا أردنا
    console.log('يمكن للتطبيق أن يُثبّت');
});

// تسجيل حدث التثبيت
window.addEventListener('appinstalled', () => {
    console.log('تم تثبيت التطبيق بنجاح');
    deferredPrompt = null;
});

// فحص التطبيق هل هو مثبت
function isAppInstalled() {
    // لـ iOS
    if (window.navigator.standalone === true) {
        return true;
    }
    // لـ Android
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    return false;
}

// إضافة معلومات عن التطبيق
console.log('منصة HealX - تطبيق ويب متقدم');
console.log('الإصدار: 1.0.0');
console.log('مثبت كتطبيق:', isAppInstalled() ? 'نعم ✓' : 'لا');


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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
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
        console.error('خطأ في تحميل هيكل الاختبارات:', error);
        // عرض رسالة خطأ للمستخدم إذا كان الخطأ بسبب CORS أو شبكة
        if (error.name === 'TypeError' && error.message.includes('CORS')) {
            console.log('استخدام بيانات تجريبية بسبب CORS...');
            // استخدام بيانات تجريبية للاختبار المحلي
            appState.testStructure = {
                "الطب البشري": {
                    "السنة الأولى": {
                        "الفصل الأول": {
                            "علم التشريح": {
                                "الوحدة 1": ["اختبار 1", "اختبار 2"],
                                "الوحدة 2": ["اختبار 3"]
                            },
                            "علم وظائف الأعضاء": {
                                "الوحدة 1": ["اختبار 1"]
                            }
                        },
                        "الفصل الثاني": {
                            "الكيمياء الحيوية": {
                                "الوحدة 1": ["اختبار 1", "اختبار 2"]
                            }
                        }
                    },
                    "السنة الثانية": {
                        "الفصل الأول": {
                            "علم الأمراض": {
                                "الوحدة 1": ["اختبار 1"]
                            }
                        }
                    }
                },
                "طب الأسنان": {
                    "السنة الأولى": {
                        "الفصل الأول": {
                            "علم التشريح السني": {
                                "الوحدة 1": ["اختبار 1"]
                            }
                        }
                    }
                }
            };
            if (appState.currentPage === 'tests') {
                renderTestsPage();
            }
            showAlert('تم تحميل بيانات تجريبية', 'تم تحميل هيكل اختبارات تجريبي بسبب عدم القدرة على الاتصال بالخادم.');
        } else {
            showAlert('خطأ في الاتصال', 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
        }
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

// تهيئة الزر بعد تحميل الصفحة
window.addEventListener('load', function() {
    // زر العودة لأعلى
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});


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
