# 🧾 Invoice Governance System - Frontend

A modern, premium web application for managing and governing invoices with advanced authentication and real-time synchronization.

## ✨ Features

- 🔐 **Advanced Authentication System**
  - JWT-based authentication
  - Two-Factor Authentication (2FA) with TOTP
  - Push authentication support
  - QR code setup for mobile devices

- 📊 **Real-time Dashboard**
  - Live statistics and analytics
  - Invoice status tracking
  - Beautiful charts and visualizations
  - Role-based access control

- 🔍 **Advanced Search & Inquiry**
  - Multi-parameter search
  - Deep external inquiry (eFinance integration)
  - Dual verification system

- 📱 **Mobile Synchronization**
  - QR code-based mobile pairing
  - Real-time URL syncing from mobile devices
  - Batch governance processing

- 🎨 **Premium UI/UX**
  - Glassmorphism design
  - Smooth animations with Framer Motion
  - Fully responsive layout
  - RTL (Arabic) support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your backend URL
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Build for Production

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ZahranTech/Zahran-System)

1. Click the button above
2. Set `Root Directory` to: `nvoice System/frontend`
3. Add environment variable: `VITE_API_URL` = your backend URL
4. Deploy!

### Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ZahranTech/Zahran-System)

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Vanilla CSS with CSS Variables
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **QR Codes**: qrcode.react

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Component styles
│   ├── index.css        # Global styles & design system
│   ├── main.jsx         # Application entry point
│   └── assets/          # Static assets
├── public/              # Public static files
├── dist/                # Production build output
├── vercel.json          # Vercel deployment config
├── netlify.toml         # Netlify deployment config
└── package.json         # Dependencies & scripts
```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | No | `http://${window.location.hostname}:8000` |

## 👥 User Roles

The system supports three user roles:

1. **Admin** - Full access to all features
2. **Supervisor** - Can unfreeze invoices
3. **Data Entry** - Can freeze invoices

## 🔐 Authentication Flow

1. **Login** - Username/password authentication
2. **2FA Setup** (first time) - Scan QR code with mobile app
3. **OTP Verification** - Enter 6-digit code from mobile app
4. **Push Authentication** (optional) - Approve login from mobile device

## 📱 Mobile Integration

The system includes mobile synchronization:

1. Scan QR code from dashboard
2. Mobile app can send invoice URLs
3. URLs automatically appear in the governance queue
4. Process multiple invoices in batch

## 🎨 Design System

The application uses a comprehensive design system with:

- CSS Custom Properties for theming
- Glassmorphism effects
- Smooth transitions and animations
- Consistent spacing and typography
- Premium color palette

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 API Integration

The frontend communicates with the Django backend via REST API:

- **Base URL**: `${VITE_API_URL}/api`
- **Authentication**: JWT Bearer tokens
- **Endpoints**:
  - `/auth/login/` - User authentication
  - `/auth/setup-2fa/` - 2FA setup
  - `/auth/verify-otp/` - OTP verification
  - `/invoices/` - Invoice management
  - `/invoices/stats/` - Statistics
  - `/mobile-sync/` - Mobile synchronization

## 🐛 Troubleshooting

### CORS Errors
Make sure your backend has the frontend URL in `CORS_ALLOWED_ORIGINS`

### Environment Variables Not Working
- Variable names must start with `VITE_`
- Restart dev server after changing `.env.local`

### Build Warnings
The large chunk size warning is expected due to chart libraries. Consider code splitting for optimization.

## 📄 License

This project is proprietary software developed for ZahranTech.

## 🤝 Support

For issues or questions, contact the development team.

---

**Built with ❤️ by ZahranTech**

