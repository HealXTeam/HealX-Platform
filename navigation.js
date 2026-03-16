// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين الصفحات
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
            
            // تحديث حالة التنقل النشط
            document.querySelectorAll('.nav-link').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // عناصر الشبكة للتنقل
    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                showPage(page);
                
                // تحديث حالة التنقل النشط
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-page') === page) {
                        link.classList.add('active');
                    }
                });
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
    
    // إخبار المتصفح أننا انتقلنا لصفحة جديدة لكي يعمل زر الرجوع
    history.pushState({page: pageId}, null, "");
    
    // إجراءات خاصة بكل صفحة
    if (pageId === 'tests') {
        renderTestsPage();
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

        // تحديث شكل القائمة العلوية (الرابط النشط)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-page="${targetPage}"]`);
        if (activeLink) activeLink.classList.add('active');
    } else {
        // إذا عاد لأول صفحة (الرئيسية)
        showPage('home');
    }
};

// جعل الدوال متاحة عالمياً
window.setupEventListeners = setupEventListeners;
window.showPage = showPage;
