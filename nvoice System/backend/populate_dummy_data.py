import os
import django
import random
import uuid
from datetime import date, timedelta

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from invoices.models import Invoice, Company

def populate():
    # Create dummy companies
    companies_data = [
        ("شركة النيل للتكنولوجيا", "100200300"),
        ("مؤسسة الأهرام التجارية", "200300400"),
        ("الشركة المصرية للخدمات", "300400500"),
        ("كايرو تريدنج", "400500600")
    ]

    companies = []
    for name, tax_id in companies_data:
        company, created = Company.objects.get_or_create(
            tax_registration_number=tax_id,
            defaults={'name': name}
        )
        companies.append(company)

    # Status distribution (12 invoices total)
    # 5 Accepted, 3 Frozen, 2 Pending, 2 Rejected
    statuses = ['accepted'] * 5 + ['frozen'] * 3 + ['pending'] * 2 + ['rejected'] * 2
    random.shuffle(statuses)

    print(f"Adding {len(statuses)} dummy invoices...")

    for i, status in enumerate(statuses):
        company = random.choice(companies)
        # Generate a semi-realistic UUID-like ID or just a random string
        invoice_id = str(uuid.uuid4())
        amount = random.randint(1000, 50000)
        
        # Random date in last 30 days
        inv_date = date.today() - timedelta(days=random.randint(0, 30))
        
        invoice = Invoice.objects.create(
            invoice_id=invoice_id,
            company=company,
            amount=amount,
            date=inv_date,
            url=f"https://invoicing.eta.gov.eg/documents/{invoice_id}/share",
            status=status,
            governance_result="تم الفحص آلياً بواسطة المنظومة" if status != 'pending' else "",
            governed_by="System Admin"
        )
        print(f"Created Invoice {i+1}: {status} - {company.name} ({amount} EGP)")

    print("\n✅ Successfully added 12 dummy invoices!")

if __name__ == "__main__":
    populate()
