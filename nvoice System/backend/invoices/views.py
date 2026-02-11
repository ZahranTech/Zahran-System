from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Count
from .models import Invoice, Company, MobileSync
from .serializers import InvoiceSerializer, CompanySerializer, MobileSyncSerializer
import subprocess
import os
import pandas as pd
import io

class MobileSyncViewSet(viewsets.ModelViewSet):
    queryset = MobileSync.objects.all().order_by('-created_at')
    serializer_class = MobileSyncSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = [] # Disable CSRF check for this public endpoint

    @action(detail=False, methods=['get'])
    def pull(self, request):
        from django.utils import timezone
        import datetime
        # Get links from last 5 minutes to be safe
        threshold = timezone.now() - datetime.timedelta(minutes=5)
        new_links = MobileSync.objects.filter(created_at__gte=threshold).order_by('-created_at')
        
        serializer = self.get_serializer(new_links, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def push(self, request):
        url = request.data.get('url')
        if not url:
            return Response({"error": "URL missing"}, status=400)
            
        print(f">>> PUSH: New link received: {url}")
        # Only create if not exists in last 10 seconds to avoid spam
        from django.utils import timezone
        import datetime
        recent = MobileSync.objects.filter(url=url, created_at__gte=timezone.now() - datetime.timedelta(seconds=10))
        if not recent.exists():
            sync_obj = MobileSync.objects.create(url=url)
            return Response({"message": "تم الاستلام بنجاح", "id": sync_obj.id})
        return Response({"message": "موجود مسبقاً", "id": recent.first().id})
    @action(detail=False, methods=['get'])
    def push_page(self, request):
        html = f"""
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>G-Invoice Live Scanner</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
            <script src="https://unpkg.com/html5-qrcode"></script>
            <style>
                body {{ font-family: 'Cairo', sans-serif; background: #020617; color: white; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 15px; box-sizing: border-box; }}
                .container {{ width: 100%; max-width: 500px; text-align: center; }}
                #reader {{ width: 100%; border-radius: 24px; overflow: hidden; border: 2px solid #00f2fe; background: #000; box-shadow: 0 0 30px rgba(0, 242, 254, 0.2); position: relative; display: none; margin-bottom: 20px; }}
                .btn-power {{ background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #000; font-weight: 800; padding: 25px; border-radius: 50%; width: 120px; height: 120px; border: none; font-size: 1rem; margin: 40px auto; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 15px 35px rgba(0, 242, 254, 0.4); transition: transform 0.2s; }}
                .btn-power:active {{ transform: scale(0.9); }}
                .status-badge {{ background: rgba(255,255,255,0.05); padding: 8px 15px; border-radius: 20px; font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 8px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.1); }}
                .dot {{ width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; animation: pulse 1.5s infinite; }}
                @keyframes pulse {{ 0% {{ opacity: 0.5; }} 50% {{ opacity: 1; }} 100% {{ opacity: 0.5; }} }}
                .overlay-text {{ position: fixed; bottom: 30px; left: 0; right: 0; text-align: center; font-size: 0.8rem; color: #64748b; padding: 0 20px; }}
                .success-toast {{ position: fixed; top: 20px; left: 20px; right: 20px; background: #22c55e; color: #000; padding: 15px; border-radius: 12px; font-weight: 800; display: none; z-index: 1000; animation: slideDown 0.3s ease-out; text-align: center; }}
                @keyframes slideDown {{ from {{ transform: translateY(-100%); }} to {{ transform: translateY(0); }} }}
            </style>
        </head>
        <body>
            <div id="toast" class="success-toast">✅ تم استلام الفاتورة في المنظومة!</div>

            <div class="container">
                <div style="margin-top: 30px; margin-bottom: 10px;">
                    <h1 style="font-size: 1.8rem; font-weight: 800; color: #00f2fe; margin-bottom: 5px;">الماسح اللحظي 👁️‍🗨️</h1>
                    <p style="color: #94a3b8; font-size: 0.9rem;">بث مباشر لمزامنة الفواتير</p>
                </div>

                <div class="status-badge" style="margin: 0 auto 30px auto; width: fit-content;">
                    <span class="dot"></span> متصل بالسيرفر المركزي (192.168.1.10)
                </div>

                <div id="reader"></div>

                <button id="startBtn" class="btn-power" onclick="initScanner()">
                    <span style="font-size: 1.5rem;">🔘</span>
                    <span>تشغيل</span>
                </button>

                <div style="margin-top: 20px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 15px;">إرسال يدوي سريع</p>
                    <input type="url" id="manualUrl" placeholder="الصق الرابط هنا..." style="width: 100%; padding: 15px; border-radius: 12px; border: 1px solid #1e293b; background: #0f172a; color: white; margin-bottom: 10px; text-align: center;">
                    <button onclick="sendManual()" style="width: 100%; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); font-weight: 600;">إرسال 📤</button>
                </div>
            </div>

            <div class="overlay-text">
                <span id="connStatus" style="color: #64748b;">⏳ جاري فحص الاتصال...</span>
            </div>

            <script>
                const html5QrCode = new Html5Qrcode("reader");
                const toast = document.getElementById('toast');
                const connStatus = document.getElementById('connStatus');

                // Check connection every 5 seconds
                async function checkConnection() {{
                    try {{
                        const res = await fetch(window.location.origin + '/api/mobile-sync/pull/');
                        if(res.ok) connStatus.innerHTML = "🟢 متصل بالسيرفر المركزي";
                        else connStatus.innerHTML = "🔴 خطأ في الاستجابة (" + res.status + ")";
                    }} catch(e) {{
                        connStatus.innerHTML = "🔴 غير متصل بالكمبيوتر (تأكد من الـ WiFi)";
                    }}
                }}
                checkConnection();
                setInterval(checkConnection, 10000);

                function showToast(count) {{
                    toast.innerText = count > 0 ? `✅ تم الإرسال! (في الانتظار: ${{count}})` : "✅ تم الإرسال والمزامنة!";
                    toast.style.display = 'block';
                    if(window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
                    setTimeout(() => {{ toast.style.display = 'none'; }}, 4000);
                }}

                async function sendToBackend(url) {{
                    try {{
                        const response = await fetch(window.location.origin + '/api/mobile-sync/push/', {{
                            method: 'POST',
                            headers: {{ 'Content-Type': 'application/json' }},
                            body: JSON.stringify({{ url: url }})
                        }});
                        const result = await response.json();
                        if(response.ok) {{
                            showToast(result.pending);
                            return true;
                        }} else {{
                            alert("Server Error: " + response.status + " - " + (result.error || "Unknown"));
                        }}
                    }} catch(e) {{
                        alert("Network Error: " + e.message + " - Check WiFi");
                    }}
                    return false;
                }}

                function initScanner() {{
                    document.getElementById('startBtn').style.display = 'none';
                    document.getElementById('reader').style.display = 'block';

                    const config = {{ 
                        fps: 15, 
                        qrbox: (viewfinderWidth, viewfinderHeight) => {{
                            return {{
                                width: viewfinderWidth * 0.7,
                                height: viewfinderWidth * 0.7
                            }};
                        }},
                        aspectRatio: 1.0
                    }};

                    html5QrCode.start(
                        {{ facingMode: "environment" }}, 
                        config,
                        async (decodedText) => {{
                            // Action on detection
                            if(window.navigator.vibrate) window.navigator.vibrate(50);
                            
                            const success = await sendToBackend(decodedText);
                            if(success) {{
                                html5QrCode.pause();
                                setTimeout(() => html5QrCode.resume(), 4000);
                            }}
                        }},
                        (errorMessage) => {{ /* silent errors */ }}
                    ).catch(err => {{
                        alert("⚠️ تنبيه أمني: المتصفح يمنع الكاميرا على الروابط غير المؤمنة (HTTP).\\n\\nللمتابعة، يرجى استخدام متصفح مغاير أو السماح للكاميرا من إعدادات الموقع.");
                        document.getElementById('startBtn').style.display = 'flex';
                        document.getElementById('reader').style.display = 'none';
                    }});
                }}

                async function sendManual() {{
                    const input = document.getElementById('manualUrl');
                    if(!input.value.trim()) return;
                    const success = await sendToBackend(input.value.trim());
                    if(success) input.value = '';
                }}
            </script>
        </body>
        </html>
        """
        return HttpResponse(html)

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        queryset = Invoice.objects.all().order_by('-created_at')
        rin = self.request.query_params.get('rin')
        invoice_id = self.request.query_params.get('invoice_id')
        status_filter = self.request.query_params.get('status')
        
        if rin:
            queryset = queryset.filter(company__tax_registration_number=rin)
        if invoice_id:
            queryset = queryset.filter(invoice_id__icontains=invoice_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

    @action(detail=False, methods=['post'])
    def start_governance(self, request):
        tax_number = request.data.get('rin')
        invoice_uuid = request.data.get('uuid')
        invoice_url = request.data.get('url')
        
        if not invoice_url and (not tax_number or not invoice_uuid):
            return Response({"error": "Invoice URL or (RIN and UUID) are required"}, status=status.HTTP_400_BAD_REQUEST)

        import sys
        script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'automation_engine.py')
        venv_python = sys.executable

        try:
            # Prepare command based on input
            cmd = [venv_python, script_path]
            if invoice_url:
                cmd.append(invoice_url)
            else:
                cmd.extend([tax_number, invoice_uuid])

            # Execute automation
            result_process = subprocess.run(
                cmd, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE, 
                text=True, 
                encoding='utf-8',
                errors='ignore'
            )
            
            output = result_process.stdout or ""
            error_output = result_process.stderr or ""
            
            # Parse the JSON from output
            import json
            res_data = {}
            for line in output.splitlines():
                if line.startswith("RESULT_JSON:"):
                    try:
                        res_data = json.loads(line.replace("RESULT_JSON:", ""))
                    except:
                        continue
                    break
            
            if res_data.get('status') == 'success':
                # Save to database
                final_rin = res_data.get('rin') or tax_number
                final_uuid = res_data.get('uuid') or invoice_uuid
                
                # Check if invoice already exists and is frozen
                existing_invoice = Invoice.objects.filter(invoice_id=final_uuid).first()
                if existing_invoice and existing_invoice.status == 'frozen':
                    return Response({
                        "result_code": "already_frozen",
                        "message": "تم إيجاد الفاتورة ولكنها مجمدة مسبقاً",
                        "rin": final_rin,
                        "uuid": final_uuid,
                        "status": "frozen"
                    }, status=status.HTTP_200_OK)

                company, _ = Company.objects.get_or_create(
                    tax_registration_number=final_rin,
                    defaults={'name': f"شركة - {final_rin}"}
                )
                
                invoice, created = Invoice.objects.update_or_create(
                    invoice_id=final_uuid,
                    defaults={
                        'company': company,
                        'status': 'frozen', # Default to frozen on success per user request
                        'governance_result': output,
                        'frozen_by': request.user if request.user.is_authenticated else None
                    }
                )
                
                return Response({
                    "result_code": "success_frozen",
                    "message": "تم إيجاد الفاتورة وتجميدها بنجاح",
                    "rin": final_rin,
                    "uuid": final_uuid,
                    "status": "frozen"
                })
            else:
                error_msg = res_data.get('message', 'فشلت الأتمتة في استخراج البيانات أو التنفيذ')
                return Response({
                    "result_code": "not_found",
                    "error": "لم يسفر البحث عن شيء أو حدث خطأ",
                    "details": error_msg,
                    "technical_details": output + error_output
                }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "error": "حدث خطأ غير متوقع أثناء تشغيل المحرك",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def check_status(self, request):
        invoice_url = request.data.get('url')
        invoice_uuid = request.data.get('uuid')
        deep_search = request.data.get('deep_search', False)

        if not invoice_uuid and invoice_url:
            import re
            match = re.search(r'([A-Z0-9-]{36})', invoice_url)
            invoice_uuid = match.group(0) if match else invoice_url.split('/')[-1].split('?')[0]

        if not invoice_uuid:
            return Response({"error": "رابط الفاتورة أو كود الفاتورة مطلوب"}, status=status.HTTP_400_BAD_REQUEST)

        local_data = None
        try:
            invoice = Invoice.objects.get(invoice_id=invoice_uuid)
            local_data = {
                "found_locally": True,
                "status": invoice.status,
                "governed_by": invoice.governed_by,
                "governance_date": invoice.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
                "company_name": invoice.company.name
            }
        except Invoice.DoesNotExist:
            local_data = {"found_locally": False}

        # لو العميل طالب "بحث عميق" في المنظومة الخارجية
        external_data = None
        if deep_search or not local_data.get('found_locally'):
            import sys
            script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'automation_engine.py')
            venv_python = sys.executable
            
            cmd = [venv_python, script_path, invoice_url or invoice_uuid, "--inquiry"]
            try:
                result_process = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
                import json
                for line in result_process.stdout.splitlines():
                    if line.startswith("RESULT_JSON:"):
                        external_data = json.loads(line.replace("RESULT_JSON:", ""))
                        break
            except: pass

        return Response({
            "local": local_data,
            "external": external_data,
            "invoice_id": invoice_uuid
        })


    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def freeze(self, request, pk=None):
        invoice = self.get_object()
        # Only DataEntry or Superuser can freeze
        if not request.user.groups.filter(name='DataEntry').exists() and not request.user.is_superuser:
            return Response({"error": "لا تملك صلاحية تجميد الفاتورة"}, status=status.HTTP_403_FORBIDDEN)
        
        invoice.status = 'frozen'
        invoice.frozen_by = request.user
        invoice.save()
        return Response({"message": "تم تجميد الفاتورة بنجاح ومنع التعديل عليها", "status": "frozen"})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unfreeze(self, request, pk=None):
        invoice = self.get_object()
        # Only Supervisor or Superuser can unfreeze
        if not request.user.groups.filter(name='Supervisor').exists() and not request.user.is_superuser:
            return Response({"error": "لا تملك صلاحية فك تجميد الفاتورة. هذه الصلاحية للمشرف فقط"}, status=status.HTTP_403_FORBIDDEN)
        
        invoice.status = 'accepted' # Or back to pending/accepted as needed
        invoice.unfrozen_by = request.user
        invoice.save()
        return Response({"message": "تم فك التجميد بنجاح. يمكن الآن إجراء التعديلات اللازمة", "status": "accepted"})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def launch_session(self, request):
        # Restriction: Only Admin or Supervisor can start the day
        is_admin = request.user.is_superuser
        is_supervisor = request.user.groups.filter(name='Supervisor').exists()
        
        if not is_admin and not is_supervisor:
            return Response({
                "error": "عذراً، هذه الصلاحية خاصة بالمشرف أو المدير فقط لبدء جلسة العمل اليومية"
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            import sys
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            project_root = os.path.dirname(backend_dir)
            script_path = os.path.join(project_root, 'launch_browser.py')
            python_path = sys.executable
            
            # Use subprocess.Popen to avoid blocking the server
            subprocess.Popen([python_path, script_path])
            
            return Response({"message": "جاري فتح المتصفح المؤمن... يرجى تسجيل الدخول وإدخال الـ OTP في النافذة المنبثقة."
            })
        except Exception as e:
            return Response({"error": f"فشل تشغيل المتصفح: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Invoice.objects.count()
        by_status = Invoice.objects.values('status').annotate(count=Count('status'))
        
        status_counts = {item['status']: item['count'] for item in by_status}
        
        return Response({
            "total": total,
            "frozen": status_counts.get('frozen', 0),
            "pending": status_counts.get('pending', 0),
            "accepted": status_counts.get('accepted', 0),
            "rejected": status_counts.get('rejected', 0),
        })

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        data = []
        for inv in queryset:
            data.append({
                'ID الفاتورة': inv.invoice_id,
                'الشركة': inv.company.name,
                'السجل الضريبي': inv.company.tax_registration_number,
                'المبلغ': inv.amount,
                'التاريخ': inv.date,
                'الحالة': inv.get_status_display(),
                'تاريخ الإضافة': inv.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'بواسطة': inv.governed_by
            })
        
        df = pd.DataFrame(data)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="invoices_report.csv"'
        response.write(u'\ufeff'.encode('utf8')) # UTF-8 BOM for Excel
        df.to_csv(path_or_buf=response, index=False, encoding='utf-8')
        return response

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        data = []
        for inv in queryset:
            data.append({
                'ID الفاتورة': inv.invoice_id,
                'الشركة': inv.company.name,
                'السجل الضريبي': inv.company.tax_registration_number,
                'المبلغ': inv.amount,
                'التاريخ': inv.date,
                'الحالة': inv.get_status_display(),
                'تاريخ الإضافة': inv.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'بواسطة': inv.governed_by
            })
        
        df = pd.DataFrame(data)
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Invoices')
        
        output.seek(0)
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="invoices_report.xlsx"'
        return response

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
