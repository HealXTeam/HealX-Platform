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
    
    // إجراءات خاصة بكل صفحة
    if (pageId === 'tests') {
        renderTestsPage();
    }
}

// جعل الدوال متاحة عالمياً
window.setupEventListeners = setupEventListeners;
window.showPage = showPage;