# 📡 API Documentation

## Base URL
```
http://localhost:8000/api/auth
```

---

## 🔓 Public Endpoints

### 1. Login
**POST** `/login/`

Login with username and password. Returns different responses based on 2FA status.

**Request Body:**
```json
{
  "username": "demo",
  "password": "Demo@123"
}
```

**Response - 2FA Required:**
```json
{
  "status": "2FA_REQUIRED",
  "message": "Please enter your OTP code",
  "temp_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response - Setup Required:**
```json
{
  "status": "SETUP_REQUIRED",
  "message": "2FA Setup Required",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Error Response:**
```json
{
  "non_field_errors": ["Incorrect Credentials"]
}
```

---

## 🔒 Protected Endpoints

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer {access_token}
```

### 2. Setup 2FA - Get QR Code
**GET** `/setup-2fa/`

Generate QR code and secret key for 2FA setup.

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Error Response:**
```json
{
  "error": "2FA already active. Revoke first."
}
```

---

### 3. Setup 2FA - Verify Code
**POST** `/setup-2fa/`

Verify OTP code to activate 2FA.

**Request Body:**
```json
{
  "otp_code": "123456"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "2FA Enabled Successfully"
}
```

**Error Response:**
```json
{
  "error": "Invalid Code"
}
```

---

### 4. Verify OTP
**POST** `/verify-2fa/`

Verify OTP code during login.

**Request Body:**
```json
{
  "otp_code": "123456"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid OTP"
}
```

---

### 5. Get Devices
**GET** `/devices/`

List all active 2FA devices for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "name": "My Device",
    "is_active": true,
    "created_at": "2026-02-03T18:30:00Z",
    "last_used_at": "2026-02-03T18:45:00Z"
  }
]
```

---

### 6. Delete Device
**DELETE** `/devices/{id}/`

Remove a 2FA device.

**Response:**
```json
{
  "status": "DELETED"
}
```

**Error Response:**
```json
{
  "error": "Not found"
}
```

---

## 🔑 JWT Token Management

### Token Refresh
**POST** `/token/refresh/`

Refresh an expired access token.

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (Invalid data) |
| 401 | Unauthorized (Invalid/expired token) |
| 404 | Not Found |
| 500 | Server Error |

---

## 🔐 Authentication Flow

### First-Time User
1. **POST** `/login/` → Get `SETUP_REQUIRED` + tokens
2. **GET** `/setup-2fa/` → Get QR code
3. Scan QR code with authenticator app
4. **POST** `/setup-2fa/` with OTP → Activate 2FA
5. Access dashboard

### Returning User
1. **POST** `/login/` → Get `2FA_REQUIRED` + temp_token
2. **POST** `/verify-2fa/` with OTP → Get full access tokens
3. Access dashboard

---

## 🛡️ Security Notes

1. **Tokens expire after 1 hour** - Use refresh token to get new access token
2. **Refresh tokens expire after 7 days** - User must login again
3. **OTP codes change every 30 seconds** - Based on TOTP algorithm
4. **Secret keys are unique per device** - Never share or expose
5. **CORS is enabled for localhost** - Update for production domains

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"Demo@123"}'
```

### Get QR Code
```bash
curl -X GET http://localhost:8000/api/auth/setup-2fa/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Verify OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-2fa/ \
  -H "Authorization: Bearer YOUR_TEMP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp_code":"123456"}'
```

### List Devices
```bash
curl -X GET http://localhost:8000/api/auth/devices/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📝 Notes

- All timestamps are in UTC
- All responses are in JSON format
- OTP codes must be exactly 6 digits
- Device names can be customized (max 64 characters)
- Multiple devices can be registered per user

---

**For more information, see the main [README.md](../README.md)**
