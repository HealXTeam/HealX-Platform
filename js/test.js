// أزرار الاختبار
document.addEventListener('DOMContentLoaded', function() {
    const finishBtn = document.getElementById('finish-btn');
    const reviewBtn = document.getElementById('review-btn');
    const backToTestsBtn = document.getElementById('back-to-tests');
    const practiceModeBtn = document.getElementById('practice-mode-btn');
    const examModeBtn = document.getElementById('exam-mode-btn');
    
    if (finishBtn) finishBtn.addEventListener('click', finishTest);
    if (reviewBtn) reviewBtn.addEventListener('click', toggleReview);
    if (backToTestsBtn) backToTestsBtn.addEventListener('click', function() {
        // إعادة ضبط الزر والقسم عند العودة للقائمة
        if (document.getElementById('review-section')) document.getElementById('review-section').style.display = 'none';
        if (document.getElementById('review-btn')) document.getElementById('review-btn').innerHTML = '<i class="fas fa-list"></i> مراجعة الإجابات';
        showPage('tests');
    });
    
    if (practiceModeBtn) {
        practiceModeBtn.addEventListener('click', function() {
            startTestWithMode('practice');
        });
    }
    
    if (examModeBtn) {
        examModeBtn.addEventListener('click', function() {
            startTestWithMode('exam');
        });
    }
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
    let html = '';
    
    // عرض إشعار الاختبار النشط إذا كان هناك اختبار قيد التقدم
    const activeTestInfo = getActiveTestInfo();
    if (activeTestInfo) {
        html += `
            <div style="background: #e8f4f8; border: 2px solid #17a2b8; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; direction: rtl;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h3 style="color: #17a2b8; margin: 0 0 0.5rem 0;">
                            <i class="fas fa-hourglass-half"></i> اختبار قيد التقدم
                        </h3>
                        <p style="color: #555; margin: 0.5rem 0; font-size: 0.95rem;">
                            <strong>${activeTestInfo.testName}</strong><br>
                            تم إجابتك على <strong>${activeTestInfo.answeredCount}/${activeTestInfo.totalCount}</strong> من الأسئلة<br>
                            <small style="color: #777;">آخر حفظ: ${activeTestInfo.savedAt}</small>
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary" style="padding: 0.7rem 1.2rem;" onclick="continueActiveTest()">
                            <i class="fas fa-play"></i> استئناف
                        </button>
                        <button class="btn btn-secondary" style="padding: 0.7rem 1.2rem;" onclick="discardActiveTest()">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '<div class="hierarchy-nav">';
    
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

// بدء اختبار مع عرض اختيار الوضع
async function startTest(branch, year, semester, subject, unitName, spreadsheetId) {
    try {
        // أضف السطرين هنا لتنظيف حالة المراجعة السابقة
        if (document.getElementById('review-section')) document.getElementById('review-section').style.display = 'none';
        if (document.getElementById('review-btn')) document.getElementById('review-btn').innerHTML = '<i class="fas fa-list"></i> مراجعة الإجابات';
        
        // التحقق من وجود اختبار قيد التقدم
        const existingProgress = loadTestProgress();
        if (existingProgress && 
            existingProgress.currentTest.subject === subject && 
            existingProgress.currentTest.unitName === unitName) {
            
            // استئناف الاختبار القديم
            const resume = confirm(`هل تريد استئناف الاختبار السابق؟\nتم حفظه في: ${existingProgress.dateString}\nتم الإجابة على ${Object.keys(existingProgress.answers).length} من ${existingProgress.questions.length} سؤال`);
            
            if (resume) {
                // استرجاع الحالة الكاملة
                appState.currentTest = existingProgress.currentTest;
                appState.questions = existingProgress.questions;
                appState.answers = existingProgress.answers;
                appState.testMode = existingProgress.testMode;
                appState.timeLeft = existingProgress.timeLeft;
                
                // تحديث الواجهة
                document.getElementById('test-title').textContent = existingProgress.currentTest.unitName;
                document.getElementById('test-meta').textContent = `الفرع: ${existingProgress.currentTest.branch} - السنة: ${existingProgress.currentTest.year}`;
                document.getElementById('test-breadcrumb').textContent = existingProgress.currentTest.unitName;
                
                // الانتقال المباشر لصفحة الاختبار
                showPage('test-active');
                startTimer();
                showQuestion(0);
                showAlert('✅ تم استئناف الاختبار', `استأنفت الاختبار السابق الذي تم حفظه`);
                return;
            } else {
                // مسح الاختبار القديم والبدء بجديد
                clearTestProgress();
            }
        }
        
        // جلب الأسئلة من API (أو من التخزين إذا فشل الاتصال)
        let data;
        try {
            const url = new URL(CONFIG.API_BASE);
            url.searchParams.set('action', 'getQuestions');
            url.searchParams.set('spreadsheetId', spreadsheetId);
            url.searchParams.set('sheetName', unitName);
            
            const response = await fetch(url.toString());
            data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'فشل في جلب الأسئلة');
            }
        } catch (error) {
            console.log('فشل الاتصال، محاولة جلب من التخزين...');
            // محاولة جلب من التخزين المحلي
            const testId = `${subject}_${unitName}`;
            const cached = await getCachedTest(testId);
            if (cached && cached.data && cached.data.questions) {
                data = { success: true, questions: cached.data.questions };
                showAlert('وضع بدون انترنت', 'تم تحميل الأسئلة من التخزين المحفوظ');
            } else {
                showAlert('خطأ', 'تعذر تحميل الأسئلة. تأكد من الاتصال بالإنترنت أو حمل الاختبارات أولاً');
                return;
            }
        }
        
        if (!data.questions || data.questions.length === 0) {
            showAlert('لا توجد أسئلة', 'لا توجد أسئلة في هذه الوحدة');
            return;
        }
        
        // تهيئة حالة الاختبار الجديدة
        appState.questions = data.questions;
        appState.answers = {};
        appState.currentQuestionIndex = 0;
        appState.timeLeft = CONFIG.DEFAULT_TIMER_SECONDS;
        appState.currentTest = {
            branch, year, semester, subject, unitName, spreadsheetId
        };
        
        // حفظ الاختبار في قاعدة البيانات للعمل الأوفلاين
        const testId = `${subject}_${unitName}`;
        cacheTest(testId, {
            questions: data.questions,
            testInfo: appState.currentTest
        });
        
        // تحديث واجهة الاختبار
        document.getElementById('test-title').textContent = unitName;
        document.getElementById('test-meta').textContent = `الفرع: ${branch} - السنة: ${year}`;
        document.getElementById('test-breadcrumb').textContent = unitName;
        
        // عرض مودال اختيار الوضع
        showModeModal();
        
    } catch (error) {
        console.error('خطأ في بدء الاختبار:', error);
        showAlert('خطأ', 'تعذر بدء الاختبار. يرجى المحاولة مرة أخرى.');
    }
}

// عرض مودال اختيار الوضع
function showModeModal() {
    document.getElementById('mode-modal').style.display = 'flex';
}

// إخفاء مودال الوضع وبدء الاختبار
function startTestWithMode(mode) {
    document.getElementById('mode-modal').style.display = 'none';
    appState.testMode = mode;
    
    // حفظ حالة الاختبار عند البدء
    saveTestProgress();
    
    // عرض صفحة الاختبار
    showPage('test-active');
    
    // بدء المؤقت
    startTimer();
    
    // عرض جميع الأسئلة
    showQuestion(0);
}

// عرض جميع الأسئلة في قائمة واحدة
function showQuestion(index) {
    const container = document.getElementById('questions-list-container');
    let questionsHtml = '';
    const optionLetters = ['أ', 'ب', 'ج', 'د', 'هـ'];
    
    appState.questions.forEach((question, qIndex) => {
        let optionsHtml = '';
        
        for (let i = 0; i < 5; i++) {
            const letter = optionLetters[i];
            const optionKey = String.fromCharCode(97 + i); // a, b, c, d, e
            const isSelected = appState.answers[qIndex] === optionKey;
            const isCorrect = appState.answers[qIndex] === question.correct;
            
            if (question[optionKey]) {
                let optionClass = 'option';
                let statusIcon = '';
                let isAnsweredInPractice = isSelected && appState.testMode === 'practice';
                
                if (isSelected) {
                    optionClass += ' selected';
                    
                    // عرض التحقق الفوري فقط في وضع التدريب
                    if (appState.testMode === 'practice') {
                        if (isCorrect) {
                            optionClass += ' correct-immediate';
                            statusIcon = '<i class="fas fa-check-circle" style="color: #28a745; margin-left: 10px;"></i>';
                        } else {
                            optionClass += ' incorrect-immediate';
                            statusIcon = '<i class="fas fa-times-circle" style="color: #dc3545; margin-left: 10px;"></i>';
                        }
                    }
                }
                
                optionsHtml += `
                    <div class="${optionClass}" data-option="${optionKey}" data-question-index="${qIndex}" ${isAnsweredInPractice ? 'style="cursor: not-allowed;"' : ''}>
                        <div class="option-label">${letter}</div>
                        <div style="flex: 1;">${question[optionKey]}</div>
                        ${statusIcon}
                    </div>
                `;
            }
        }
        
        let imageHtml = '';
        if (question.imageUrl) {
            imageHtml = `<img src="${question.imageUrl}" alt="صورة السؤال" class="question-image" style="max-width: 100%; max-height: 300px; margin: 15px 0; border-radius: 8px;">`;
        }
        
        questionsHtml += `
            <div class="question-item">
                <div class="question-text">س${qIndex + 1}. ${question.question}</div>
                ${imageHtml}
                <div class="options-container">
                    ${optionsHtml}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = questionsHtml;
    
    // إضافة مستمعي الأحداث لجميع الخيارات
    container.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            const qIndex = parseInt(this.getAttribute('data-question-index'));
            
            // في وضع التدريب، لا يسمح بتعديل الإجابة بعد اختيارها
            if (appState.testMode === 'practice' && appState.answers[qIndex] !== undefined) {
                return; // منع التغيير
            }
            
            const selectedOption = this.getAttribute('data-option');
            // حفظ الإجابة (يحفظ الحالة تلقائياً)
            saveAnswer(qIndex, selectedOption);
            
            // إعادة رسم الأسئلة لتحديث الحالة
            showQuestion(0);
        });
    });
    
    // تحديث شريط التقدم
    updateProgressBar();
}

// تحديث شريط التقدم
function updateProgressBar() {
    const answeredCount = Object.keys(appState.answers).length;
    const progress = (answeredCount / appState.questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    
    // أيضاً عرض النص
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = `تم الإجابة على: ${answeredCount}/${appState.questions.length}`;
    }
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
    
    // حفظ الوقت المتبقي كل ثانية
    saveTestProgress();
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
    
    // حفظ النتيجة في قاعدة البيانات
    saveTestResult({
        testName: `${appState.currentTest.subject} - ${appState.currentTest.unitName}`,
        score: score,
        totalQuestions: appState.questions.length,
        percentage: percentage.toFixed(1),
        mode: appState.testMode
    });
    
    // مسح حالة الاختبار الحالي (لا نفتح اختبار نفس الوحدة لا حاجة للاستئناف)
    clearTestProgress();
    
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
    
    // في وضع التدريب، عرض المراجعة تلقائياً
    if (appState.testMode === 'practice') {
        showPracticeReview();
    } else {
        // في وضع الامتحان، إخفاء قسم المراجعة
        document.getElementById('review-section').style.display = 'none';
    }
    
    // عرض صفحة النتائج
    showPage('results');
}

// عرض مراجعة وضع التدريب
function showPracticeReview() {
    const reviewSection = document.getElementById('review-section');
    const reviewContent = document.getElementById('review-content');
    
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
        const optionLetters = ['أ', 'ب', 'ج', 'د', 'هـ'];
        
        for (let j = 0; j < 5; j++) {
            const letter = optionLetters[j];
            const optionKey = String.fromCharCode(97 + j); // a, b, c, d, e
            
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
}

// تبديل عرض المراجعة
function toggleReview() {
    const reviewSection = document.getElementById('review-section');
    const reviewContent = document.getElementById('review-content');
    
    if (reviewSection.style.display === 'none' || reviewSection.style.display === '') {
        // في وضع الامتحان، عرض المراجعة عند إنهاء الاختبار
        if (appState.testMode === 'exam') {
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
                const optionLetters = ['أ', 'ب', 'ج', 'د', 'هـ'];
                
                for (let j = 0; j < 5; j++) {
                    const letter = optionLetters[j];
                    const optionKey = String.fromCharCode(97 + j); // a, b, c, d, e
                    
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
        }
        
        reviewSection.style.display = 'block';
        document.getElementById('review-btn').innerHTML = '<i class="fas fa-times"></i> إخفاء المراجعة';
    } else {
        reviewSection.style.display = 'none';
        document.getElementById('review-btn').innerHTML = '<i class="fas fa-list"></i> مراجعة الإجابات';
    }
}

// استئناف الاختبار النشط
function continueActiveTest() {
    const progress = loadTestProgress();
    if (!progress) {
        showAlert('خطأ', 'لم يتم العثور على اختبار قيد التقدم');
        return;
    }
    
    // استرجاع حالة الاختبار الكاملة
    appState.currentTest = progress.currentTest;
    appState.questions = progress.questions;
    appState.answers = progress.answers;
    appState.testMode = progress.testMode;
    appState.timeLeft = progress.timeLeft;
    
    // تحديث الواجهة
    document.getElementById('test-title').textContent = progress.currentTest.unitName;
    document.getElementById('test-meta').textContent = `الفرع: ${progress.currentTest.branch} - السنة: ${progress.currentTest.year}`;
    document.getElementById('test-breadcrumb').textContent = progress.currentTest.unitName;
    
    // الانتقال المباشر للاختبار
    showPage('test-active');
    startTimer();
    showQuestion(0);
}

// حذف الاختبار النشط
function discardActiveTest() {
    if (confirm('هل أنت متأكد من رغبتك في حذف الاختبار القيد التقدم؟ لا يمكن استرجاعه.')) {
        clearTestProgress();
        renderTestsPage();
        showAlert('تم بنجاح', 'تم حذف الاختبار القيد التقدم');
    }
}

// جعل الدوال متاحة عالمياً
window.navigateTo = navigateTo;
window.startTest = startTest;
window.startTestWithMode = startTestWithMode;
window.showModeModal = showModeModal;
window.finishTest = finishTest;
window.toggleReview = toggleReview;
window.renderTestsPage = renderTestsPage;
window.renderBranches = renderBranches;
window.continueActiveTest = continueActiveTest;
window.discardActiveTest = discardActiveTest;
window.renderYears = renderYears;
window.renderSemesters = renderSemesters;
window.renderSubjects = renderSubjects;
window.renderUnits = renderUnits;
window.showQuestion = showQuestion;
window.startTimer = startTimer;
window.updateTimerDisplay = updateTimerDisplay;
window.updateProgressBar = updateProgressBar;
window.showPracticeReview = showPracticeReview;
