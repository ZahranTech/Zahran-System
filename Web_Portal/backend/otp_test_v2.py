import requests
import json
import base64
import pyotp

def test_otp_flow():
    base_url = "http://127.0.0.1:8000/api/auth"
    
    # 1. Login
    print("\n--- 1. Testing Login ---")
    login_data = {
        "username": "demo",
        "password": "Demo@123"
    }
    
    try:
        response = requests.post(f"{base_url}/login/", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        login_json = response.json()
        
        if login_json.get('status') == 'SETUP_REQUIRED':
            print("\nSetup required detected - Proceeding to setup flow")
            access_token = login_json['tokens']['access']
            headers = {"Authorization": f"Bearer {access_token}"}
            
            # 2. Get QR Code/Secret
            print("\n--- 2. Getting Secret/QR ---")
            setup_response = requests.get(f"{base_url}/setup-2fa/", headers=headers)
            print(f"Status Code: {setup_response.status_code}")
            print(f"Response: {setup_response.text}")
            
            setup_data = setup_response.json()
            secret = setup_data['secret']
            print(f"Got Secret: {secret}")
            
            # 3. Generate OTP
            print("\n--- 3. Generating OTP ---")
            totp = pyotp.TOTP(secret)
            current_otp = totp.now()
            print(f"Generated Code: {current_otp}")
            
            # 4. Verify Setup
            print("\n--- 4. Verifying Setup ---")
            verify_data = {"otp_code": current_otp}
            verify_response = requests.post(
                f"{base_url}/setup-2fa/", 
                json=verify_data, 
                headers=headers
            )
            print(f"Status Code: {verify_response.status_code}")
            print(f"Response: {verify_response.text}")
            
        elif login_json.get('status') == '2FA_REQUIRED':
            print("\n2FA is already enabled for this user.")
            print("To re-test setup, you must delete the device first.")
            
    except Exception as e:
        print(f"\nError occurred: {str(e)}")

if __name__ == "__main__":
    test_otp_flow()
