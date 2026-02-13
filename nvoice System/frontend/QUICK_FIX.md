# ⚡ خطوات سريعة لحل المشكلة

## 🎯 المطلوب منك الآن

### 1️⃣ إضافة متغير البيئة في Vercel (الأهم!)

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروعك
3. Settings → Environment Variables
4. أضف:
   ```
   Name:  VITE_API_URL
   Value: https://your-backend.onrender.com
   ```
   ⚠️ **استبدل الرابط برابط Backend الحقيقي من Render**

5. احفظ (Save)

---

### 2️⃣ إعادة نشر Backend على Render

قم بتشغيل هذه الأوامر في Terminal:

```powershell
cd "d:\ZahranTeck\Invoice Governance System\nvoice System\backend"
git add .
git commit -m "Update CORS settings for Vercel deployment"
git push origin master
```

انتظر 2-3 دقائق حتى يكتمل النشر على Render.

---

### 3️⃣ إعادة نشر Frontend على Vercel

**الطريقة الأولى** (من Vercel Dashboard):
1. اذهب إلى Deployments
2. اضغط على النشر الأخير
3. اضغط Redeploy

**الطريقة الثانية** (من Terminal):
```powershell
cd "d:\ZahranTeck\Invoice Governance System\nvoice System\frontend"
git commit --allow-empty -m "Trigger Vercel redeploy with env vars"
git push origin master
```

---

### 4️⃣ اختبار النتيجة

1. افتح التطبيق: https://zahran-system-ci9dzwtx4-zahrans-projects-7fe13656.vercel.app/
2. اضغط F12 لفتح Developer Tools
3. جرب تسجيل الدخول:
   - Username: `admin`
   - Password: `admin`

---

## ✅ علامات النجاح

- ✅ تظهر رسالة خطأ عند إدخال بيانات خاطئة (معناها Backend متصل)
- ✅ تسجيل الدخول يعمل بنجاح
- ✅ لا توجد أخطاء CORS في Console

---

## ❌ إذا لم يعمل

راجع الملف الكامل: `VERCEL_LOGIN_FIX.md`

---

**ملاحظة**: أهم خطوة هي **إضافة متغير البيئة في Vercel**!
