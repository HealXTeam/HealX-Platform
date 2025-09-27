// أزرار الاختبار
document.addEventListener('DOMContentLoaded', function() {
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const finishBtn = document.getElementById('finish-btn');
    const reviewBtn = document.getElementById('review-btn');
    const backToTestsBtn = document.getElementById('back-to-tests');
    
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (prevBtn) prevBtn.addEventListener('click', prevQuestion);
    if (finishBtn) finishBtn.addEventListener('click', finishTest);
    if (reviewBtn) reviewBtn.addEventListener('click', toggleReview);
    if (backToTestsBtn) backToTestsBtn.addEventListener('click', function() {
        showPage('tests');
    });
});

// عرض صفحة الاختبارات مع الهيكل الهرمي
function renderTestsPage() {
    const testsContent = document.getElementById('tests-content');
    
    if (!appState.testStructure) {
        testsContent.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>جارٍ تحميل هيكل الاختبارات...</p>
            </div>
        `;
        return;
    }
    
    // إذا لم يكن هناك مستوى محدد، نعرض الفروع
    if (appState.navigationStack.length === 0) {
        renderBranches();
        return;
    }
}

// عرض الفروع
function renderBranches() {
    const testsContent = document.getElementById('tests-content');
    let html = '<div class="hierarchy-nav">';
    
    html += `
        <div class="hierarchy-level">
            <h3>الفروع</h3>
            <div class="hierarchy-items">
    `;
    
    for (const branch in appState.testStructure) {
        html += `
            <div class="hierarchy-item" onclick="navigateTo('branch', '${branch}')">
                <i class="fas fa-folder"></i>
                <span>${branch}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    html += '</div>';
    testsContent.innerHTML = html;
}

// التنقل بين المستويات
function navigateTo(levelType, levelName) {
    if (levelType === 'branch') {
        appState.navigationStack = [{ type: 'branch', name: levelName }];
        renderYears(levelName);
    } else if (levelType === 'year') {
        const branch = appState.navigationStack[0].name;
        appState.navigationStack.push({ type: 'year', name: levelName });
        renderSemesters(branch, levelName);
    } else if (levelType === 'semester') {
        const branch = appState.navigationStack[0].name;
        const year = appState.navigationStack[1].name;
        appState.navigationStack.push({ type: 'semester', name: levelName });
        renderSubjects(branch, year, levelName);
    } else if (levelType === 'subject') {
        const branch = appState.navigationStack[0].name;
        const year = appState.navigationStack[1].name;
        const semester = appState.navigationStack[2].name;
        appState.navigationStack.push({ type: 'subject', name: levelName });
        renderUnits(branch, year, semester, levelName);
    }
}

// عرض السنوات
function renderYears(branch) {
    const testsContent = document.getElementById('tests-content');
    let html = '<div class="hierarchy-nav">';
    
    // عرض الفروع
    html += `
        <div class="hierarchy-level">
            <h3>الفروع</h3>
            <div class="hierarchy-items">
    `;
    
    for (const b in appState.testStructure) {
        const isActive = b === branch;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('branch', '${b}')">
                <i class="fas fa-folder${isActive ? '-open' : ''}"></i>
                <span>${b}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض السنوات
    html += `
        <div class="hierarchy-level">
            <h3>السنوات</h3>
            <div class="hierarchy-items">
    `;
    
    for (const year in appState.testStructure[branch]) {
        html += `
            <div class="hierarchy-item" onclick="navigateTo('year', '${year}')">
                <i class="fas fa-calendar-alt"></i>
                <span>${year}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    html += '</div>';
    testsContent.innerHTML = html;
}

// عرض الفصول الدراسية
function renderSemesters(branch, year) {
    const testsContent = document.getElementById('tests-content');
    let html = '<div class="hierarchy-nav">';
    
    // عرض الفروع
    html += `
        <div class="hierarchy-level">
            <h3>الفروع</h3>
            <div class="hierarchy-items">
    `;
    
    for (const b in appState.testStructure) {
        const isActive = b === branch;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('branch', '${b}')">
                <i class="fas fa-folder${isActive ? '-open' : ''}"></i>
                <span>${b}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض السنوات
    html += `
        <div class="hierarchy-level">
            <h3>السنوات</h3>
            <div class="hierarchy-items">
    `;
    
    for (const y in appState.testStructure[branch]) {
        const isActive = y === year;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('year', '${y}')">
                <i class="fas fa-calendar-alt"></i>
                <span>${y}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض الفصول الدراسية
    html += `
        <div class="hierarchy-level">
            <h3>الفصول الدراسية</h3>
            <div class="hierarchy-items">
    `;
    
    for (const semester in appState.testStructure[branch][year]) {
        html += `
            <div class="hierarchy-item" onclick="navigateTo('semester', '${semester}')">
                <i class="fas fa-book"></i>
                <span>${semester}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    html += '</div>';
    testsContent.innerHTML = html;
}

// عرض المواد
function renderSubjects(branch, year, semester) {
    const testsContent = document.getElementById('tests-content');
    let html = '<div class="hierarchy-nav">';
    
    // عرض الفروع
    html += `
        <div class="hierarchy-level">
            <h3>الفروع</h3>
            <div class="hierarchy-items">
    `;
    
    for (const b in appState.testStructure) {
        const isActive = b === branch;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('branch', '${b}')">
                <i class="fas fa-folder${isActive ? '-open' : ''}"></i>
                <span>${b}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض السنوات
    html += `
        <div class="hierarchy-level">
            <h3>السنوات</h3>
            <div class="hierarchy-items">
    `;
    
    for (const y in appState.testStructure[branch]) {
        const isActive = y === year;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('year', '${y}')">
                <i class="fas fa-calendar-alt"></i>
                <span>${y}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض الفصول الدراسية
    html += `
        <div class="hierarchy-level">
            <h3>الفصول الدراسية</h3>
            <div class="hierarchy-items">
    `;
    
    for (const sem in appState.testStructure[branch][year]) {
        const isActive = sem === semester;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('semester', '${sem}')">
                <i class="fas fa-book"></i>
                <span>${sem}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض المواد
    html += `
        <div class="hierarchy-level">
            <h3>المواد</h3>
            <div class="hierarchy-items">
    `;
    
    for (const subject in appState.testStructure[branch][year][semester]) {
        html += `
            <div class="hierarchy-item" onclick="navigateTo('subject', '${subject}')">
                <i class="fas fa-file-alt"></i>
                <span>${subject}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    html += '</div>';
    testsContent.innerHTML = html;
}

// عرض الوحدات
function renderUnits(branch, year, semester, subject) {
    const testsContent = document.getElementById('tests-content');
    let html = '<div class="hierarchy-nav">';
    
    // عرض الفروع
    html += `
        <div class="hierarchy-level">
            <h3>الفروع</h3>
            <div class="hierarchy-items">
    `;
    
    for (const b in appState.testStructure) {
        const isActive = b === branch;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('branch', '${b}')">
                <i class="fas fa-folder${isActive ? '-open' : ''}"></i>
                <span>${b}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض السنوات
    html += `
        <div class="hierarchy-level">
            <h3>السنوات</h3>
            <div class="hierarchy-items">
    `;
    
    for (const y in appState.testStructure[branch]) {
        const isActive = y === year;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('year', '${y}')">
                <i class="fas fa-calendar-alt"></i>
                <span>${y}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض الفصول الدراسية
    html += `
        <div class="hierarchy-level">
            <h3>الفصول الدراسية</h3>
            <div class="hierarchy-items">
    `;
    
    for (const sem in appState.testStructure[branch][year]) {
        const isActive = sem === semester;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('semester', '${sem}')">
                <i class="fas fa-book"></i>
                <span>${sem}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض المواد
    html += `
        <div class="hierarchy-level">
            <h3>المواد</h3>
            <div class="hierarchy-items">
    `;
    
    for (const sub in appState.testStructure[branch][year][semester]) {
        const isActive = sub === subject;
        html += `
            <div class="hierarchy-item ${isActive ? 'active' : ''}" onclick="navigateTo('subject', '${sub}')">
                <i class="fas fa-file-alt"></i>
                <span>${sub}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // عرض الوحدات
    html += `
        <div class="hierarchy-level">
            <h3>الوحدات</h3>
            <div class="hierarchy-items">
    `;
    
    const units = appState.testStructure[branch][year][semester][subject];
    units.forEach(unit => {
        html += `
            <div class="hierarchy-item" onclick="startTest('${branch}', '${year}', '${semester}', '${subject}', '${unit.sheetName}', '${unit.spreadsheetId}')">
                <i class="fas fa-play-circle"></i>
                <span>${unit.name || unit.sheetName}</span>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    html += '</div>';
    testsContent.innerHTML = html;
}

// بدء اختبار
async function startTest(branch, year, semester, subject, unitName, spreadsheetId) {
    try {
        // جلب الأسئلة من API
        const url = new URL(CONFIG.API_BASE);
        url.searchParams.set('action', 'getQuestions');
        url.searchParams.set('spreadsheetId', spreadsheetId);
        url.searchParams.set('sheetName', unitName);
        
        const response = await fetch(url.toString());
        const data = await response.json();
        
        if (!data.success) {
            showAlert('خطأ', data.message || 'فشل في جلب الأسئلة');
            return;
        }
        
        if (!data.questions || data.questions.length === 0) {
            showAlert('لا توجد أسئلة', 'لا توجد أسئلة في هذه الوحدة');
            return;
        }
        
        appState.questions = data.questions;
        appState.answers = {};
        appState.currentQuestionIndex = 0;
        appState.timeLeft = CONFIG.DEFAULT_TIMER_SECONDS;
        appState.currentTest = {
            branch, year, semester, subject, unitName, spreadsheetId
        };
        
        // تحديث واجهة الاختبار
        document.getElementById('test-title').textContent = unitName;
        document.getElementById('test-meta').textContent = `الفرع: ${branch} - السنة: ${year}`;
        document.getElementById('test-breadcrumb').textContent = unitName;
        
        // عرض صفحة الاختبار
        showPage('test-active');
        
        // بدء المؤقت
        startTimer();
        
        // عرض السؤال الأول
        showQuestion(appState.currentQuestionIndex);
        
    } catch (error) {
        showAlert('خطأ', 'تعذر بدء الاختبار. يرجى المحاولة مرة أخرى.');
    }
}

// عرض سؤال
function showQuestion(index) {
    const question = appState.questions[index];
    const container = document.getElementById('question-container');
    
    let optionsHtml = '';
    const optionLetters = ['أ', 'ب', 'ج', 'د'];
    
    for (let i = 0; i < 4; i++) {
        const letter = optionLetters[i];
        const optionKey = String.fromCharCode(97 + i); // a, b, c, d
        const isSelected = appState.answers[index] === optionKey;
        
        if (question[optionKey]) { // فقط إذا كان الخيار موجوداً
            optionsHtml += `
                <div class="option ${isSelected ? 'selected' : ''}" data-option="${optionKey}">
                    <div class="option-label">${letter}</div>
                    <div>${question[optionKey]}</div>
                </div>
            `;
        }
    }
    
    let imageHtml = '';
    if (question.imageUrl) {
        imageHtml = `<img src="${question.imageUrl}" alt="صورة السؤال" class="question-image">`;
    }
    
    container.innerHTML = `
        <div class="question-text">س${index + 1}. ${question.question}</div>
        ${imageHtml}
        <div class="options-container">
            ${optionsHtml}
        </div>
    `;
    
    // إضافة مستمعي الأحداث للخيارات
    container.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            const selectedOption = this.getAttribute('data-option');
            appState.answers[index] = selectedOption;
            
            // تحديث المظهر
            container.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
    
    // تحديث شريط التقدم
    updateProgressBar();
    
    // إظهار/إخفاء أزرار التنقل
    document.getElementById('prev-btn').style.display = index === 0 ? 'none' : 'inline-flex';
    document.getElementById('next-btn').style.display = index === appState.questions.length - 1 ? 'none' : 'inline-flex';
}

// السؤال التالي
function nextQuestion() {
    if (appState.currentQuestionIndex < appState.questions.length - 1) {
        appState.currentQuestionIndex++;
        showQuestion(appState.currentQuestionIndex);
    }
}

// السؤال السابق
function prevQuestion() {
    if (appState.currentQuestionIndex > 0) {
        appState.currentQuestionIndex--;
        showQuestion(appState.currentQuestionIndex);
    }
}

// تحديث شريط التقدم
function updateProgressBar() {
    const progress = ((appState.currentQuestionIndex + 1) / appState.questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

// بدء المؤقت
function startTimer() {
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
    }
    
    updateTimerDisplay();
    
    appState.timerInterval = setInterval(() => {
        appState.timeLeft--;
        updateTimerDisplay();
        
        if (appState.timeLeft <= 0) {
            clearInterval(appState.timerInterval);
            finishTest();
        }
    }, 1000);
}

// تحديث عرض المؤقت
function updateTimerDisplay() {
    const minutes = Math.floor(appState.timeLeft / 60);
    const seconds = appState.timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// إنهاء الاختبار
function finishTest() {
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
    }
    
    // حساب النتيجة
    let score = 0;
    for (let i = 0; i < appState.questions.length; i++) {
        if (appState.answers[i] === appState.questions[i].correct) {
            score++;
        }
    }
    
    const percentage = (score / appState.questions.length) * 100;
    
    // تحديث عرض النتيجة
    document.getElementById('score-value').textContent = `${score}/${appState.questions.length}`;
    document.getElementById('score-text').textContent = `${percentage.toFixed(1)}%`;
    document.getElementById('score-circle').style.setProperty('--score-percent', `${percentage}%`);
    
    // رسالة النتيجة
    let message = '';
    if (percentage >= 90) {
        message = 'ممتاز! أداء رائع.';
    } else if (percentage >= 70) {
        message = 'جيد جداً! استمر في التقدم.';
    } else if (percentage >= 50) {
        message = 'مقبول، لكن تحتاج إلى مزيد من المراجعة.';
    } else {
        message = 'يجب التركيز أكثر على المادة الدراسية.';
    }
    
    document.getElementById('result-message').innerHTML = `
        <h3>${message}</h3>
        <p>أجبت بشكل صحيح على ${score} من أصل ${appState.questions.length} سؤالاً.</p>
    `;
    
    // إخفاء قسم المراجعة
    document.getElementById('review-section').style.display = 'none';
    
    // عرض صفحة النتائج
    showPage('results');
}

// تبديل عرض المراجعة
function toggleReview() {
    const reviewSection = document.getElementById('review-section');
    const reviewContent = document.getElementById('review-content');
    
    if (reviewSection.style.display === 'none') {
        let reviewHtml = '';
        
        for (let i = 0; i < appState.questions.length; i++) {
            const question = appState.questions[i];
            const userAnswer = appState.answers[i];
            const correctAnswer = question.correct;
            
            let imageHtml = '';
            if (question.imageUrl) {
                imageHtml = `<img src="${question.imageUrl}" alt="صورة السؤال" class="question-image" style="max-height: 200px;">`;
            }
            
            let noteHtml = '';
            if (question.note) {
                noteHtml = `<div class="review-option" style="background: rgba(23, 162, 184, 0.1); border-color: var(--info); margin-top: 10px;">
                    <strong>ملاحظة:</strong> ${question.note}
                </div>`;
            }
            
            // عرض جميع الخيارات مع تمييز الإجابات
            let optionsHtml = '<div class="review-options">';
            const optionLetters = ['أ', 'ب', 'ج', 'د'];
            
            for (let j = 0; j < 4; j++) {
                const letter = optionLetters[j];
                const optionKey = String.fromCharCode(97 + j); // a, b, c, d
                
                if (question[optionKey]) {
                    let optionClass = 'review-option';
                    let indicator = '';
                    
                    if (optionKey === correctAnswer) {
                        optionClass += ' correct-answer';
                        indicator = '<span class="option-indicator">✓</span>';
                    }
                    
                    if (optionKey === userAnswer) {
                        optionClass += ' user-answer';
                    }
                    
                    optionsHtml += `
                        <div class="${optionClass}">
                            ${indicator}
                            <strong>${letter}:</strong> ${question[optionKey]}
                        </div>
                    `;
                }
            }
            
            optionsHtml += '</div>';
            
            reviewHtml += `
                <div class="review-item">
                    <div class="review-question">س${i + 1}. ${question.question}</div>
                    ${imageHtml}
                    ${optionsHtml}
                    ${noteHtml}
                </div>
            `;
        }
        
        reviewContent.innerHTML = reviewHtml;
        reviewSection.style.display = 'block';
        document.getElementById('review-btn').innerHTML = '<i class="fas fa-times"></i> إخفاء المراجعة';
    } else {
        reviewSection.style.display = 'none';
        document.getElementById('review-btn').innerHTML = '<i class="fas fa-list"></i> مراجعة الإجابات';
    }
}

// جعل الدوال متاحة عالمياً
window.navigateTo = navigateTo;
window.startTest = startTest;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.finishTest = finishTest;
window.toggleReview = toggleReview;
window.renderTestsPage = renderTestsPage;
window.renderBranches = renderBranches;
window.renderYears = renderYears;
window.renderSemesters = renderSemesters;
window.renderSubjects = renderSubjects;
window.renderUnits = renderUnits;
window.showQuestion = showQuestion;
window.startTimer = startTimer;
window.updateTimerDisplay = updateTimerDisplay;
window.updateProgressBar = updateProgressBar;
