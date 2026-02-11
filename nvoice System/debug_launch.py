import requests
import json

BASE_URL = 'http://localhost:8000/api'
AUTH_URL = 'http://localhost:8000/api-token-auth/'

def debug():
    # 1. Login
    print("Attempting to login...")
    try:
        res = requests.post(AUTH_URL, json={'username': 'admin', 'password': 'admin123'}, timeout=5)
        if res.status_code != 200:
            print(f"Login Failed: {res.status_code} {res.text}")
            return
        token = res.json()['token']
        print(f"Login Successful. Token: {token[:10]}...")
    except Exception as e:
        print(f"Login Exception: {e}")
        return

    # 2. Launch Session
    print("Attempting to launch session...")
    headers = {'Authorization': f'Token {token}'}
    try:
        res = requests.post(f"{BASE_URL}/invoices/launch_session/", headers=headers, timeout=10)
        print(f"Status Code: {res.status_code}")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Launch Session Exception: {e}")

if __name__ == "__main__":
    debug()
