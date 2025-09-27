// نموذج التواصل مع الدعم
document.addEventListener('DOMContentLoaded', function() {
    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitSupportForm();
        });
    }
});

// إرسال نموذج التواصل مع الدعم
function submitSupportForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // التحقق من الحقول المطلوبة
    if (!name || !email || !subject || !message) {
        showAlert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    // إنشاء نص الرسالة
    const emailBody = `
الاسم: ${name}
البريد الإلكتروني: ${email}
الموضوع: ${subject}

الرسالة:
${message}

---
هذه الرسالة مرسلة من خلال منصة HealX
    `;
    
    // فتح بريد المستخدم الإلكتروني
    const mailtoLink = `mailto:${CONFIG.SUPPORT_EMAIL}?subject=طلب دعم: ${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    showAlert('تم التحضير', 'تم فتح بريدك الإلكتروني. يرجى إرسال الرسالة يدوياً.');
    document.getElementById('support-form').reset();
}

// جعل الدوال متاحة عالمياً
window.submitSupportForm = submitSupportForm;