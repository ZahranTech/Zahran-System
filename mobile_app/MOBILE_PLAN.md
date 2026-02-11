# 📱 ZahranAuth - Mobile Application Plan

This document outlines the roadmap for building the Flutter-based mobile authenticator app.

## 🏗️ Architecture (Flutter)

### 1. **Tech Stack**
- **Framework:** Flutter (Dart)
- **State Management:** Riverpod or Provider
- **Storage:** `flutter_secure_storage` (For storing Secret Keys)
- **Networking:** `dio` (For API calls)
- **OTP Generation:** `otp` (Dart package)
- **QR Scanning:** `mobile_scanner`

### 2. **Key Modules**

#### A. Auth Module 🔐
- **Login Screen:** Connects to Django Backend.
- **Device Registration:**
  - Auto-fetch `Setup2FA` endpoint.
  - Extract Secret Key.
  - Store safely in Keychain/Keystore.

#### B. Core Module ⚡
- **TOTP Generator:**
  - Reads Secret from Secure Storage.
  - Generates 6-digit code every 30s.
  - Visual circular progress indicator.

#### C. Security Module 🛡️
- **Screen Protections:** Prevent screenshots.
- **Biometrics:** Require Fingerprint/FaceID to view codes.
- **Kill Switch:** Poll API periodically to check if device is revoked.

---

## 🚀 Installation & Setup Guide (Windows)

Since `flutter` is not currently installed in your path, follow these steps:

### 1. Download Flutter
1. Go to: [https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.16.9-stable.zip](https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.16.9-stable.zip)
2. Extract the `flutter` folder to `C:\src\flutter` (Do not install in Program Files).

### 2. Update Path
1. Search for "Env" in Start Menu -> "Edit the system environment variables".
2. Click **Environment Variables**.
3. Under **User variables**, find `Path` -> Edit -> New.
4. Add: `C:\src\flutter\bin`.

### 3. Verify
Open a **new** terminal and run:
```bash
flutter doctor
```

---

## 📅 Development Roadmap

### Phase 1: Skeleton
- [ ] Create Flutter Project
- [ ] Setup Folder Structure (MVVM)
- [ ] Install Dependencies

### Phase 2: Authentication
- [ ] Build Login UI
- [ ] Integrate Login API
- [ ] Handle JWT Storage

### Phase 3: OTP Logic
- [ ] Fetch Secret Key Logic
- [ ] Implement TOTP Algorithm
- [ ] Build Home Screen (Code Display)

### Phase 4: Polish
- [ ] Animations
- [ ] Dark Mode
- [ ] Biometrics
