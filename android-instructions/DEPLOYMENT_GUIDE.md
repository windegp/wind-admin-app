# دليل التنفيذ النهائي — بناء APK عبر GitHub Actions (بدون أي تثبيت محلي)

## الخطوة 1: احصل على google-services.json من Firebase Console

1. روح [Firebase Console](https://console.firebase.google.com)
2. اختار مشروع **wind-reviews** (نفس المشروع المستخدم حاليًا للويب)
3. دوس على أيقونة الترس ⚙️ بجوار "Project Overview" → **Project settings**
4. تمرّر لأسفل لقسم **"Your apps"**
5. دوس على أيقونة Android (الشكل الأخضر)
6. في حقل **Android package name** اكتب بالضبط:
   ```
   com.windeg.admin
   ```
7. حقل App nickname (اختياري): `WIND Admin`
8. اضغط **Register app**
9. اضغط **Download google-services.json**
10. **لا تكمل باقي خطوات الإعداد المعروضة في Firebase (إضافة SDK يدويًا)** —
    Capacitor بيتولى هذا تلقائيًا. اضغط "Skip this step" أو أغلق النافذة.

---

## الخطوة 2: ضع الملف في المكان الصحيح

الملف اللي نزّلته (`google-services.json`) يُوضع في:
```
android/app/google-services.json
```

⚠️ ملحوظة: مجلد `android/` لسه مش موجود في مشروعك المحلي لأن GitHub Actions
هو اللي هيولّده تلقائيًا أثناء الـ build. لذلك سنرفع الملف في مكان مؤقت،
والـ workflow سيتولى نقله للمكان الصحيح بعد توليد مجلد android.

**الحل العملي**: ضع الملف في جذر المشروع باسم `google-services.json`،
وسأضيف خطوة في workflow تنقله تلقائيًا للمسار الصحيح بعد `npx cap add android`.

---

## الخطوة 3: أنشئ مستودع (Repository) جديد على GitHub

1. روح [github.com/new](https://github.com/new)
2. اسم المستودع: `wind-admin-app` (أو أي اسم تفضله)
3. اختار **Private** (مهم — المشروع فيه إعدادات حساسة)
4. لا تضف README أو .gitignore الآن (سنرفعهم يدويًا)
5. اضغط **Create repository**

---

## الخطوة 4: رفع الملفات

### الطريقة الأسهل: GitHub Web Upload (بدون Git محلي)

1. في صفحة المستودع الجديد، دوس على **"uploading an existing file"**
2. اسحب كل الملفات والمجلدات التالية (من نفس هيكل المشروع المُجهّز):
   - `package.json`
   - `capacitor.config.ts`
   - `vite.config.ts`
   - `tsconfig.json`
   - `index.html`
   - `src/` (المجلد بالكامل)
   - `.github/` (المجلد بالكامل — **مهم جدًا**، فيه الـ workflow)
   - `google-services.json` (الملف اللي نزّلته من Firebase)
3. اكتب رسالة commit بسيطة: "Initial setup"
4. اضغط **Commit changes**

---

## الخطوة 5: تابع الـ Build

1. بعد الرفع مباشرة، روح لتبويب **Actions** في صفحة المستودع
2. لازم تشوف workflow اسمه **"Build Android APK"** شغال تلقائيًا (دائرة صفراء دوّارة)
3. انتظر 3-5 دقائق (أول build بياخد وقت أطول لأنه بيحمّل كل الأدوات من الصفر)
4. لو خلص بعلامة ✅ خضراء → نجح
5. لو ظهرت علامة ❌ حمراء → افتح الـ log وابعتلي نص الخطأ بالكامل

---

## الخطوة 6: نزّل الـ APK

1. بعد نجاح الـ build، دوس على الـ workflow run نفسه
2. تمرّر لأسفل لقسم **Artifacts**
3. هتلاقي ملف اسمه **wind-admin-debug-apk** — دوسه عشان ينزل (zip فيه الـ APK)
4. فك الضغط، وانقل ملف `app-debug.apk` لموبايلك (عبر رابط مباشر، USB، أو
   تطبيق نقل ملفات)
5. على الموبايل: فعّل "تثبيت من مصادر غير معروفة" (Install unknown apps)
   من إعدادات الأمان، وثبّت الملف مباشرة

---

## ملاحظة هامة جدًا: هذا debug build فقط

ما سنبنيه الآن هو **نسخة Debug** للتجربة فقط — تعمل تمامًا وتختبر بها
الإشعارات، لكنها غير موقعة (unsigned) بشكل نهائي ومش مخصصة لرفعها على
Google Play Store. بعد التأكد من نجاح الإشعارات بصوت مخصص، سنحتاج خطوة
إضافية (توليد keystore وتوقيع رسمي) فقط إذا قررت نشر التطبيق على Play
Store لاحقًا. للاستخدام الشخصي/الداخلي (تثبيت على موبايلك وموبايل فريقك
مباشرة)، نسخة Debug هذه كافية تمامًا وتعمل بكل الميزات.

---

## الخطوة التالية بعد نجاح هذا الجزء

بعد ما تتأكد إن الـ APK اتثبت وسجّل توكن Native بنجاح، رجعلي وهنكمل بـ:
1. إنشاء `/api/register-admin-token/route.js` في مشروع windeg الأساسي
   (لاستقبال هذا التوكن وحفظه في `adminTokens`)
2. تعديل `fcmAdmin.js` لإضافة `android.notification.sound` في الـ payload
   لكل توكن يُحدَّد كـ `platform: "android-native"`
3. اختبار نهائي: إغلاق التطبيق بالكامل + عمل أوردر تجريبي + التأكد من
   صوت مخصص فعلي
