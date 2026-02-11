import subprocess
import time
import os

def launch_secure_browser():
    # Path to Chrome (common location on Windows)
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    user_data_dir = os.path.join(os.environ['LOCALAPPDATA'], 'Google', 'Chrome', 'User Data', 'GovernanceProfile')
    
    if not os.path.exists(user_data_dir):
        os.makedirs(user_data_dir)

    print(f"🚀 Launching Chrome in Secure Automation Mode...")
    print(f"📁 Profile Path: {user_data_dir}")
    
    # Command to launch chrome with remote debugging enabled
    cmd = [
        chrome_path,
        f"--remote-debugging-port=9222",
        f"--user-data-dir={user_data_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "https://gfn-spgs.efinance.com.eg/client/InvoiceInquiry/TempFreezeInvoice"
    ]
    
    try:
        subprocess.Popen(cmd)
        print("✅ Chrome started. Please wait 5 seconds for initialization...")
        time.sleep(5)
        print("🌐 You can now login to your portals in the opened window.")
    except Exception as e:
        print(f"❌ Error launching Chrome: {e}")

if __name__ == "__main__":
    launch_secure_browser()
