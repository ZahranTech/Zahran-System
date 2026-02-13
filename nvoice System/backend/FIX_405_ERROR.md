# 🔧 حل خطأ 405 (Method Not Allowed)

## 🔴 المشكلة
```
Failed to load resource: the server responded with a status of 405
```

## 🎯 السبب
Django's **CSRF protection** كان يمنع الطلبات من نطاق Vercel.

## ✅ الحل الذي تم تطبيقه

تم إضافة الإعدادات التالية في `backend/core/settings.py`:

```python
# CSRF Settings for cross-origin requests
CSRF_TRUSTED_ORIGINS = [
    'https://zahran-system-ci9dzwtx4-zahrans-projects-7fe13656.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# Allow CORS methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

---

## 📋 الخطوات المطلوبة الآن

### 1️⃣ دفع التغييرات إلى Git

```powershell
cd "d:\ZahranTeck\Invoice Governance System\nvoice System\backend"
git add .
git commit -m "Fix 405 error: Add CSRF_TRUSTED_ORIGINS for Vercel"
git push origin master
```

### 2️⃣ انتظر إعادة نشر Backend

- Render سيقوم بإعادة النشر تلقائياً
- انتظر 2-3 دقائق
- تحقق من Logs في Render للتأكد من نجاح النشر

### 3️⃣ اختبر التطبيق مرة أخرى

1. افتح: https://zahran-system-ci9dzwtx4-zahrans-projects-7fe13656.vercel.app/
2. جرب تسجيل الدخول:
   - Username: `admin`
   - Password: `admin`

---

## ✅ النتيجة المتوقعة

بعد إعادة نشر Backend:
- ✅ لن يظهر خطأ 405
- ✅ تسجيل الدخول سيعمل بنجاح
- ✅ أو ستظهر رسالة خطأ واضحة من Backend (إذا كانت البيانات خاطئة)

---

## 🔍 ما الذي تم إصلاحه؟

### قبل:
- ❌ Django يرفض الطلبات من Vercel بسبب CSRF
- ❌ خطأ 405: Method Not Allowed

### بعد:
- ✅ Django يثق بنطاق Vercel
- ✅ يسمح بطلبات POST من Vercel
- ✅ تسجيل الدخول يعمل بشكل صحيح

---

## 📝 ملاحظات مهمة

1. **CSRF_TRUSTED_ORIGINS** يخبر Django أن هذه النطاقات موثوقة
2. **CORS_ALLOW_METHODS** يحدد الطرق المسموحة (GET, POST, etc.)
3. هذه الإعدادات آمنة لأننا حددنا نطاقات محددة فقط

---

## 🆘 إذا استمر الخطأ

تحقق من:
1. ✅ هل تم دفع التغييرات إلى Git؟
2. ✅ هل اكتمل النشر على Render؟
3. ✅ هل أضفت `VITE_API_URL` في Vercel؟

---

**تاريخ الإصلاح**: 13 فبراير 2026  
**الحالة**: جاهز للاختبار ✅
