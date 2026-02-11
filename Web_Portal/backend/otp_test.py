import requests
import pyotp

# 1. Login
login_url = "http://127.0.0.1:8000/api/auth/login/"
data = {"username": "demo", "password": "Demo@123"}
response = requests.post(login_url, json=data)
print("Login Response Code:", response.status_code)
print("Login Response Json:", response.json())

if response.status_code == 200:
    json_data = response.json()
    if json_data.get('status') == 'SETUP_REQUIRED':
        tokens = json_data.get('tokens')
        access_token = tokens['access']
        print("\nGot Access Token for Setup:", access_token[:20] + "...")

        # 2. Get QR / Secret
        setup_url = "http://127.0.0.1:8000/api/auth/setup-2fa/"
        headers = {"Authorization": f"Bearer {access_token}"}
        setup_res = requests.get(setup_url, headers=headers)
        print("\nSetup Response Code:", setup_res.status_code)
        setup_data = setup_res.json()
        secret = setup_data.get('secret')
        print("Got Secret:", secret)

        if secret:
            # 3. Generate OTP
            totp = pyotp.TOTP(secret)
            otp_code = totp.now()
            print("Generated OTP:", otp_code)

            # 4. Verify Setup
            verify_url = "http://127.0.0.1:8000/api/auth/setup-2fa/"
            verify_data = {"otp_code": otp_code}
            verify_res = requests.post(verify_url, json=verify_data, headers=headers)
            print("Verify Response Code:", verify_res.status_code)
            print("Verify Response Json:", verify_res.json())

    elif json_data.get('status') == '2FA_REQUIRED':
        print("\nUser already has 2FA enabled. Please delete device first manually.")
