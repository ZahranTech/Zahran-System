from playwright.sync_api import sync_playwright
import json
import os
import sys

# Force UTF-8 for console output to avoid 'charmap' errors on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def run_governance(tax_number=None, invoice_uuid=None, invoice_url=None, inquiry_mode=False):
    print(f"🚀 البدء في {'الاستعلام الخارجي' if inquiry_mode else 'الحوكمة الذكية'}...")
    
    with sync_playwright() as p:
        try:
            # Try connecting to existing browser (created by launch_browser.py)
            connected_to_existing = False
            try:
                browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
                context = browser.contexts[0]
                page = context.new_page()
                connected_to_existing = True
                print("✅ Connected to existing Secure Browser session.")
            except Exception as e:
                print(f"⚠️ Could not connect to existing browser: {e}. Launching new headless instance.")
                browser = p.chromium.launch(headless=True)
                context = browser.new_context()
                page = context.new_page()
            
            # استخراج البيانات لو مش موجودة
            if invoice_url and (not tax_number or not invoice_uuid):
                print(f"🔗 فتح الرابط لاستخراج البيانات...")
                page.goto(invoice_url)
                page.wait_for_load_state("networkidle")
                
                if not invoice_uuid:
                    import re
                    match = re.search(r'([A-Z0-9-]{36})', invoice_url)
                    if match: invoice_uuid = match.group(0)

                if not tax_number:
                    selectors = ["#TaxRegistrationNumber", ".tax-id", "td:has-text('رقم التسجيل') + td"]
                    for selector in selectors:
                        try:
                            el = page.wait_for_selector(selector, timeout=2000)
                            tax_number = el.inner_text().strip()
                            if tax_number: break
                        except: continue
                
            if not tax_number or not invoice_uuid:
                return {"status": "error", "message": "فشل استخراج البيانات"}

            # التوجه لصفحة الاستعلام
            target_url = "https://gfn-spgs.efinance.com.eg/client/InvoiceInquiry/TempFreezeInvoice"
            page.goto(target_url)
            page.wait_for_load_state("networkidle")

            page.fill("#RIN", tax_number)
            page.fill("#invoiceId", invoice_uuid)
            page.click("#btnInquire")
            
            page.wait_for_timeout(3000) 
            
            # قراءة النتيجة من الشاشة
            # ملاحظة: السيلكتورات دي تخيلية بناءً على المتوقع من السيستم
            external_status = "غير معروف"
            try:
                # بنحاول ندور على نصوص تدل على الحالة
                content = page.content()
                if "مقبولة" in content or "Accepted" in content:
                    external_status = "accepted"
                elif "مرفوضة" in content or "Rejected" in content:
                    external_status = "rejected"
                elif "لم يتم العثور" in content:
                    external_status = "not_found"
            except: pass

            print(f"✅ النتيجة الخارجية: {external_status}")
            
            # Cleanup for existing session to avoid tab clutter
            if connected_to_existing:
                page.close()
                browser.disconnect()
            else:
                browser.close()

            return {
                "status": "success", 
                "external_status": external_status,
                "rin": tax_number, 
                "uuid": invoice_uuid
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    result = {"status": "error", "message": "No arguments provided"}
    import json
    
    # التحقق لو فيه علم الاستعلام --inquiry
    inquiry = "--inquiry" in sys.argv
    args = [a for a in sys.argv if not a.startswith('--')]

    if len(args) > 1:
        arg = args[1]
        if arg.startswith('http'):
            result = run_governance(invoice_url=arg, inquiry_mode=inquiry)
        elif len(args) > 2:
            result = run_governance(tax_number=args[1], invoice_uuid=args[2], inquiry_mode=inquiry)
    
    print(f"RESULT_JSON:{json.dumps(result)}")
