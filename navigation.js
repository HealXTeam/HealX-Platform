// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين الصفحات
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // عناصر الشبكة للتنقل
    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                showPage(page);
            }
        });
    });
    
    // أزرار المودال
    document.getElementById('modal-confirm').addEventListener('click', function() {
        document.getElementById('alert-modal').style.display = 'none';
    });
    
    document.getElementById('modal-cancel').addEventListener('click', function() {
        document.getElementById('alert-modal').style.display = 'none';
    });
    
    // زر تحميل وحفظ الاختبارات
    const syncBtn = document.getElementById('sync-tests-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', syncTestsFromAPI);
    }
}

// عرض صفحة معينة
function showPage(pageId) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // عرض الصفحة المطلوبة
    document.getElementById(pageId).classList.add('active');
    appState.currentPage = pageId;

    // تحديث حالة ظهور زر إنهاء الاختبار العائم (إن وُجد)
    if (window.updateMiniFinishButtonVisibility) {
        window.updateMiniFinishButtonVisibility();
    }
    
    // تحديث حالة التنقل النشط في الـ header
    updateNavActiveState(pageId);
    
    // إخبار المتصفح أننا انتقلنا لصفحة جديدة لكي يعمل زر الرجوع
    history.pushState({page: pageId}, null, "");
    
    // إجراءات خاصة بكل صفحة
    if (pageId === 'tests') {
        renderTestsPage();
        // updateTestsStatusUI(); // تم تعطيل لأن الدالة غير موجودة
    } else if (pageId === 'results') {
        // إعادة ضبط زر المراجعة لوضعه الافتراضي
        const reviewBtn = document.getElementById('review-btn');
        const reviewSection = document.getElementById('review-section');
        if (reviewBtn) reviewBtn.innerHTML = '<i class="fas fa-list"></i> مراجعة الإجابات';
        if (reviewSection) reviewSection.style.display = 'none';
    }
}

// مراقبة الضغط على زر الرجوع في المتصفح أو الهاتف
window.onpopstate = function(event) {
    if (event.state && event.state.page) {
        // إذا كان هناك صفحة مسجلة في التاريخ، نفتحها
        const targetPage = event.state.page;
        
        // إخفاء الكل وإظهار الصفحة المطلوبة
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(targetPage).classList.add('active');

        // تحديث حالة التنقل النشط في الـ header
        updateNavActiveState(targetPage);
        
        // إعادة ضبط زر المراجعة إذا كانت الصفحة results
        if (targetPage === 'results') {
            const reviewBtn = document.getElementById('review-btn');
            const reviewSection = document.getElementById('review-section');
            if (reviewBtn) reviewBtn.innerHTML = '<i class="fas fa-list"></i> مراجعة الإجابات';
            if (reviewSection) reviewSection.style.display = 'none';
        }
    } else {
        // إذا عاد لأول صفحة (الرئيسية)
        showPage('home');
    }
};

// جعل الدوال متاحة عالمياً
window.setupEventListeners = setupEventListeners;
window.showPage = showPage;

// تحديث حالة التنقل النشط في الـ header
function updateNavActiveState(pageId) {
    // تحديد الـ nav-link المناسب بناءً على الصفحة
    let activeNavPage;
    switch (pageId) {
        case 'home':
            activeNavPage = 'home';
            break;
        case 'tests':
        case 'test-active':
        case 'results':
            activeNavPage = 'tests';
            break;
        case 'about':
            activeNavPage = 'about';
            break;
        case 'support':
            activeNavPage = 'support';
            break;
        default:
            activeNavPage = 'home';
    }
    
    // تحديث حالة التنقل النشط
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === activeNavPage) {
            link.classList.add('active');
        }
    });
}
