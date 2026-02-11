# 🚀 Quick Start Guide

Get your OTP system running in **5 minutes**!

---

## ✅ Prerequisites Check

Before starting, make sure you have:
- ✅ Python 3.10+ installed
- ✅ Node.js 18+ installed
- ✅ A terminal/command prompt open

---

## 🎯 Step 1: Start Backend (30 seconds)

Open a terminal and run:

```bash
cd d:\ZahranTeck\OTP\backend
.\venv\Scripts\activate
python manage.py runserver
```

✅ **You should see:**
```
Starting development server at http://127.0.0.1:8000/
```

**Keep this terminal open!**

---

## 🎨 Step 2: Start Frontend (30 seconds)

Open a **NEW** terminal and run:

```bash
cd d:\ZahranTeck\OTP\frontend
npm run dev
```

✅ **You should see:**
```
VITE v7.3.1  ready in 463 ms
➜  Local:   http://localhost:5173/
```

**Keep this terminal open too!**

---

## 🌐 Step 3: Open Your Browser

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see a beautiful login page! 🎉

---

## 🔐 Step 4: Login

Use these demo credentials:

```
Username: demo
Password: Demo@123
```

Click **"Sign In"**

---

## 📱 Step 5: Setup 2FA

1. You'll see a **QR Code** on the screen
2. Open your phone's authenticator app:
   - **Google Authenticator** (Recommended)
   - **Microsoft Authenticator**
   - **Authy**
   - Any TOTP app

3. **Scan the QR Code** with your app
4. Enter the **6-digit code** shown in your app
5. Click **"Activate 2FA"**

---

## 🎉 Step 6: You're In!

Welcome to your **Security Dashboard**! 🎊

You can now:
- ✅ View your active devices
- ✅ See security status
- ✅ Add more devices
- ✅ Remove old devices

---

## 🔄 Next Login

From now on, when you login:

1. Enter **username** and **password**
2. Enter the **6-digit code** from your authenticator app
3. Access granted! 🔓

---

## 🛑 Troubleshooting

### Backend won't start?
```bash
# Make sure you're in the right directory
cd d:\ZahranTeck\OTP\backend

# Activate virtual environment
.\venv\Scripts\activate

# Try again
python manage.py runserver
```

### Frontend won't start?
```bash
# Make sure you're in the right directory
cd d:\ZahranTeck\OTP\frontend

# Install dependencies if needed
npm install

# Try again
npm run dev
```

### Can't scan QR code?
- Click the **Copy** button next to the secret key
- Manually enter the key in your authenticator app

### Invalid OTP code?
- Make sure your phone's time is correct
- OTP codes change every 30 seconds
- Try the next code if one expires

---

## 📞 Need Help?

Check the full documentation:
- [README.md](README.md) - Complete guide
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference

---

## 🎯 What's Next?

Explore these features:
1. **Add Multiple Devices** - Setup 2FA on multiple phones
2. **Device Management** - Remove devices you don't use
3. **Security Tips** - Learn best practices

---

**Enjoy your secure authentication system! 🔐✨**

Built with ❤️ by ZahranTeck
