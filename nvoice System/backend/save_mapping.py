import json
import os

# Create a config directory for automation settings
CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config')
if not os.path.exists(CONFIG_DIR):
    os.makedirs(CONFIG_DIR)

CONFIG_FILE = os.path.join(CONFIG_DIR, 'automation_mapping.json')

# The mapping data provided by the user
mapping_data = {
    "url": "https://gfn-spgs.efinance.com.eg/client/InvoiceInquiry/TempFreezeInvoice",
    "selectors": {
        "tax_registration_number": "#RIN",
        "invoice_id": "#invoiceId",
        "btn_inquire": "#btnInquire",
        "btn_add": "#btnAdd"
    },
    "automation_type": "remote_debugging",
    "browser_port": 9222
}

def save_config():
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(mapping_data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    save_config()
    print(f"✅ Configuration saved to {CONFIG_FILE}")
