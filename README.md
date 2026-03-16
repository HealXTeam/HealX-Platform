# 🏥 منصة فريق HealX - منصة تعليمية طبية تفاعلية

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red)]()

## 📌 نبذة عن المشروع

**HealX** منصة تعليمية طبية تفاعلية مصممة خصيصاً لطلاب المجمع الطبي لمساعدتهم في رحلتهم الدراسية.

### ✨ المميزات الرئيسية:

- 📱 **تطبيق ويب تفاعلي** - يعمل على جميع الأجهزة (ديسكتوب، تابلت، موبايل)
- 🧠 **نظام اختبارات ذكي** مع وضعين:
  - **وضع التدريب**: إجابات مقفلة، تحقق فوري، مراجعة تلقائية
  - **وضع الامتحان**: إجابات حرة، تحقق مؤجل عند الإنهاء
  
- 🌐 **عمل بدون إنترنت (PWA)**:
  - يعمل تماماً بدون اتصال بالإنترنت بعد التحميل الأول
  - حفظ تلقائي للأسئلة والإجابات في التخزين المحلي
  - استئناف الاختبار من حيث توقفت

- 💾 **تخزين ذكي للبيانات**:
  - تخزين في الذاكرة المحلية (localStorage) للسرعة
  - تخزين في قاعدة بيانات محلية (IndexedDB) للبيانات الكبيرة
  - Service Worker لتخزين الأصول الثابتة

- 📊 **إحصائيات وتتبع**:
  - عداد الزيارات التفاعلي
  - حفظ نتائج الاختبارات تاريخياً
  - معلومات تفصيلية عن الأداء

- 🎨 **واجهة مستخدم احترافية**:
  - تصميم استجابي (Responsive Design)
  - دعم الوضع الليلي (Dark Mode)
  - رسوم توضيحية وأيقونات احترافية

- 📥 **التثبيت كتطبيق محلي**:
  - تثبيت كتطبيق على هاتفك أو جهازك
  - اختصار على الشاشة الرئيسية
  - تجربة تطبيق أصلي بدون متصفح

---

## 🚀 البدء السريع

### المتطلبات:
- متصفح حديث يدعم:
  - ES6+ JavaScript
  - Service Workers
  - IndexedDB
  - Fetch API

### التثبيت:

#### 1️⃣ **للاستخدام المحلي (Local Development)**

```bash
# استنسخ المستودع
git clone https://github.com/HealX-Team/HealX-Platform.git
cd HealX-Platform

# شغّل HTTP server (يدعم Service Worker)
npx http-server

# أو استخدم Python:
python -m http.server 8000

# ثم افتح المتصفح على:
http://localhost:8000
```

#### 2️⃣ **للنشر على GitHub Pages (الإنتاج)**

```bash
# غيّر اسم المستودع إلى: username.github.io
# أو فعّل GitHub Pages من الإعدادات
# ثم push الملفات

git add .
git commit -m "Initial HealX Platform"
git push origin main
```

ثم افتح: `https://yourusername.github.io`

#### 3️⃣ **كتطبيق محلي**
- افتح الموقع في متصفحك
- اضغط على قائمة المتصفح (≡) 
- اختر "Install HealX" أو "Add to Home Screen"

---

## 📂 هيكل المشروع

```
HealX-Platform/
├── index.html              # الصفحة الرئيسية
├── manifest.json           # إعدادات PWA
├── service-worker.js       # العمل بدون إنترنت
├── css/
│   ├── style.css          # الأنماط الأساسية
│   └── responsive.css     # الاستجابة للأجهزة المختلفة
├── js/
│   ├── app.js             # الإعدادات والبيانات
│   ├── navigation.js      # نظام التنقل
│   ├── test.js            # نظام الاختبارات
│   └── support.js         # صفحة الدعم
├── images/                # الصور والشعارات
├── PWA_README.md          # توثيق PWA المفصل
├── QUICK_START.md         # دليل البدء السريع
├── .gitignore            # تجاهل الملفات
└── README.md             # هذا الملف
```

---

## 🔧 الميزات التقنية المتقدمة

### ✅ حفظ واسترجاع حالة الاختبار
```javascript
// يتم حفظ تلقائياً:
- الأسئلة المحملة
- الإجابات التي أدخلتها
- التقدم في الاختبار
- الوقت المتبقي
- وضع الاختبار (تدريب/امتحان)
```

### ✅ المزامنة الذكية
- تحميل البيانات من الخادم عند الاتصال
- حفظ تلقائي للاختبارات الجديدة
- استخدام البيانات المخزنة عند قطع الإنترنت

### ✅ قاعدة بيانات محلية
```
IndexedDB (HealXDB v1)
├── visitors        → تتبع الزيارات
├── cachedTests     → الأسئلة المحفوظة
├── testResults     → النتائج المحفوظة
└── pendingRequests → الطلبات المعلقة
```

### ✅ التخزين المحلي
```
localStorage
├── healx_cached_structure  → هيكل الاختبارات
├── healx_active_test       → الاختبار الحالي
├── lastVisit               → تاريخ آخر زيارة
└── theme                   → تفضيل اللون (فاتح/داكن)
```

---

## 📡 التكامل مع Google Apps Script

المنصة تتصل بـ Google Apps Script API للحصول على:
- هيكل الاختبارات (الفروع، السنوات، الفصول، المواد)
- الأسئلة والخيارات
- الإجابات الصحيحة

**الاتصال يتم من خلال:**
```javascript
CONFIG.API_BASE = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
```

تحديث الـ Script ID في `js/app.js` بـ ID خادمك.

---

## 🛡️ الأمان والخصوصية

### ✅ البيانات المحلية
- جميع البيانات تُحفظ محلياً في جهاز المستخدم
- **لا يتم** إرسال الإجابات الشخصية للخادم (إلا النتائج النهائية اختياراً)
- الخصوصية محمية بنسبة 100%

### ✅ HTTPS للنشر
- استخدم HTTPS دائماً في الإنتاج
- Service Worker يعمل فقط على HTTPS (و localhost للتطوير)
- حماية من Downgrade Attacks

### ✅ الامتثال
- GDPR compatible (لا تجميع البيانات الشخصية)
- لا توجد تتبعات خارجية
- شفافية كاملة في استخدام البيانات

---

## 📖 التوثيق الإضافية

- **[PWA_README.md](./PWA_README.md)** - شرح الإنترنت والعمل بدون اتصال
- **[QUICK_START.md](./QUICK_START.md)** - دليل البدء السريع

---

## 🎯 الخطوات التالية والتحسينات المستقبلية

- [ ] إضافة نظام مستخدمين متقدم
- [ ] تطبيق موبايل محلي (React Native)
- [ ] نظام تعليقات وأسئلة من الطلاب
- [ ] لوحة تحكم للمعلمين
- [ ] نشاط فيديو وشروحات إضافية
- [ ] سوق الاختبارات (مشاركة الاختبارات المخصصة)
- [ ] إحصائيات متقدمة وتجميع النتائج

---

## 🤝 المساهمة

نرحب بمساهماتك! 

```bash
# 1. اعمل Fork للمستودع
# 2. اعمل Feature Branch
git checkout -b feature/amazing-feature

# 3. اعمل Commit
git commit -m "Add amazing feature"

# 4. اعمل Push
git push origin feature/amazing-feature

# 5. افتح Pull Request
```

---

## 📞 التواصل والدعم

- 📧 **البريد الإلكتروني**: healxteam@gmail.com
- 📱 **Telegram**: [@HealX_Team](https://t.me/HealX_Team)
- 🐙 **GitHub Issues**: استفسارات وتقارير الأخطاء

---

## 📄 الترخيص

هذا المشروع مرخص تحت **MIT License** - انظر [LICENSE](./LICENSE) للتفاصيل.

---

## 👥 الفريق

تم تطويره بواسطة **فريق HealX** 

> نخطط، نتعاون، ونحدث فرقاً! 💚

---

## 📊 الإحصائيات

![GitHub Stars](https://img.shields.io/github/stars/HealX-Team/HealX-Platform?style=social)
![GitHub Forks](https://img.shields.io/github/forks/HealX-Team/HealX-Platform?style=social)
![License](https://img.shields.io/badge/license-MIT-green)

---

**شكراً لاستخدامك HealX! 🙏**

أي أسئلة أو اقتراحات؟ لا تتردد في التواصل معنا! 💬
