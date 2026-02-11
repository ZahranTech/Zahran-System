# 🔐 ZahranTeck OTP - Professional Two-Factor Authentication System

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Django](https://img.shields.io/badge/Django-6.0.2-green)
![React](https://img.shields.io/badge/React-18+-blue)
![Security](https://img.shields.io/badge/Security-2FA%20Enabled-red)

**A state-of-the-art, enterprise-grade OTP authentication system with stunning UI/UX**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture) • [Screenshots](#screenshots)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- ✅ **TOTP-Based 2FA** - Industry-standard Time-based One-Time Password (RFC 6238)
- ✅ **QR Code Generation** - Instant setup with any authenticator app
- ✅ **Multi-Device Support** - Manage multiple authentication devices
- ✅ **Device Management** - Add, view, and revoke devices instantly
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Session Management** - Automatic token refresh and expiry handling

### 🎨 Premium Design
- ✅ **Glassmorphism UI** - Modern, frosted-glass aesthetic
- ✅ **Animated Gradients** - Dynamic, eye-catching backgrounds
- ✅ **Framer Motion** - Smooth, professional animations
- ✅ **Responsive Design** - Perfect on desktop, tablet, and mobile
- ✅ **Dark Theme** - Easy on the eyes, professional look
- ✅ **Micro-interactions** - Delightful hover effects and transitions

### 🔒 Security Features
- ✅ **Secret Key Encryption** - Each device has a unique secret
- ✅ **30-Second OTP Rotation** - Codes expire automatically
- ✅ **Instant Revocation** - Disable compromised devices immediately
- ✅ **CORS Protection** - Secure cross-origin requests
- ✅ **Token Blacklisting** - Logout invalidates tokens
- ✅ **Password Validation** - Django's built-in validators

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment:**
   ```bash
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies** (already installed):
   ```bash
   pip install django djangorestframework django-cors-headers djangorestframework-simplejwt pyotp qrcode pillow
   ```

4. **Run migrations** (already done):
   ```bash
   python manage.py migrate
   ```

5. **Create demo user** (already created):
   ```bash
   python manage.py create_demo_user
   ```

6. **Start the server:**
   ```bash
   python manage.py runserver
   ```
   Backend will run on: **http://localhost:8000**

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies** (already installed):
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on: **http://localhost:5173**

---

## 📖 Usage

### Demo Credentials
```
Username: demo
Password: Demo@123
```

### User Flow

1. **Login** → Enter username and password
2. **Setup 2FA** → Scan QR code with Google/Microsoft Authenticator
3. **Verify** → Enter 6-digit code from your app
4. **Dashboard** → Manage your devices, view security status

### Supported Authenticator Apps
- ✅ Google Authenticator
- ✅ Microsoft Authenticator
- ✅ Authy
- ✅ Any TOTP-compatible app

---

## 🏗️ Architecture

### Tech Stack

#### Backend
- **Framework:** Django 6.0.2
- **API:** Django REST Framework
- **Authentication:** Simple JWT
- **OTP:** PyOTP (TOTP implementation)
- **QR Codes:** qrcode + Pillow
- **CORS:** django-cors-headers

#### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Project Structure

```
OTP/
├── backend/
│   ├── authentication/          # Main app
│   │   ├── models.py           # TOTPDevice model
│   │   ├── views.py            # API endpoints
│   │   ├── serializers.py      # Data validation
│   │   └── urls.py             # URL routing
│   ├── otp_core/               # Django project
│   │   ├── settings.py         # Configuration
│   │   └── urls.py             # Main routing
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Setup2FA.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js          # API service
│   │   ├── App.jsx             # Main app
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   └── package.json
│
└── README.md
```

---

## 🔐 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login/` | Login with credentials | No |
| GET | `/api/auth/setup-2fa/` | Get QR code for setup | Yes |
| POST | `/api/auth/setup-2fa/` | Verify and activate 2FA | Yes |
| POST | `/api/auth/verify-2fa/` | Verify OTP during login | Yes |
| GET | `/api/auth/devices/` | List all devices | Yes |
| DELETE | `/api/auth/devices/{id}/` | Delete a device | Yes |

---

## 🎨 Design Highlights

### Color Palette
- **Primary:** Blue (#0ea5e9) to Purple (#764ba2)
- **Accent:** Cyan, Green, Pink
- **Background:** Animated gradients
- **Glass:** rgba(255, 255, 255, 0.1) with backdrop blur

### Animations
- ✨ Fade-in on page load
- ✨ Slide-up for cards
- ✨ Pulse for active elements
- ✨ Shimmer for loading states
- ✨ Smooth transitions on all interactions

### Typography
- **Font:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800

---

## 🔒 Security Best Practices

1. **Never share your secret key** - It's unique to your device
2. **Use strong passwords** - Combine letters, numbers, symbols
3. **Enable biometric lock** - On your authenticator app
4. **Backup recovery codes** - In case you lose your device
5. **Review devices regularly** - Remove unused devices
6. **Use HTTPS in production** - Never send tokens over HTTP

---

## 🚀 Production Deployment

### Backend (Django)

1. **Update settings.py:**
   ```python
   DEBUG = False
   ALLOWED_HOSTS = ['yourdomain.com']
   SECRET_KEY = 'your-production-secret-key'
   ```

2. **Use PostgreSQL:**
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'otp_db',
           'USER': 'your_user',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

3. **Deploy with Gunicorn:**
   ```bash
   pip install gunicorn
   gunicorn otp_core.wsgi:application --bind 0.0.0.0:8000
   ```

### Frontend (React)

1. **Update API URL in `src/services/api.js`:**
   ```javascript
   const API_BASE_URL = 'https://api.yourdomain.com/api/auth';
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Deploy to Netlify/Vercel:**
   - Upload `dist/` folder
   - Configure redirects for SPA routing

---

## 📊 Database Schema

### TOTPDevice Model

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| user | ForeignKey | Link to User model |
| name | CharField | Device name |
| secret_key | CharField | TOTP secret (32 chars) |
| is_active | Boolean | Device status |
| last_verified_counter | BigInteger | Prevent replay attacks |
| created_at | DateTime | Creation timestamp |
| last_used_at | DateTime | Last usage timestamp |

---

## 🎯 Future Enhancements

- [ ] **Custom Android App** - Branded authenticator app
- [ ] **SMS Backup** - Fallback OTP via SMS
- [ ] **Email Notifications** - Alert on new device addition
- [ ] **Audit Logs** - Track all authentication attempts
- [ ] **Recovery Codes** - One-time backup codes
- [ ] **Biometric Auth** - WebAuthn integration
- [ ] **Admin Dashboard** - Manage all users and devices
- [ ] **Rate Limiting** - Prevent brute force attacks

---

## 📝 License

This project is proprietary software developed by **ZahranTeck**.

---

## 👨‍💻 Developer

**Built with ❤️ by ZahranTeck**

For support or inquiries: demo@zahrantech.com

---

## 🙏 Acknowledgments

- **Django** - The web framework for perfectionists
- **React** - A JavaScript library for building user interfaces
- **PyOTP** - Python One-Time Password Library
- **Framer Motion** - Production-ready animation library
- **Tailwind CSS** - A utility-first CSS framework

---

<div align="center">

**⭐ If you like this project, please give it a star! ⭐**

Made with 🔐 and ✨ by ZahranTeck

</div>
