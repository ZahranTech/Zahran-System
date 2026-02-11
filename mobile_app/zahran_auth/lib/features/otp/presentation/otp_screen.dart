import 'dart:async';
import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/security_service.dart';
import '../domain/otp_repository.dart';
import '../../auth/presentation/login_screen.dart';
import './scanner_screen.dart';
import '../../../../core/utils/api_service.dart';
import '../../../../core/utils/network_manager.dart';

class OtpScreen extends StatefulWidget {
  final String? username;
  final String? secret;

  const OtpScreen({super.key, this.username, this.secret});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  final _repository = OtpRepository();
  final _security = SecurityService();
  final _apiService = ApiService();
  
  List<OtpAccount> _accounts = [];
  bool _isLoading = true;
  int _timeLeft = 30;
  Timer? _timer;
  Timer? _pushTimer;
  late AnimationController _pulseController;
  
  bool _isAuthenticated = false;
  bool _isCheckingAuth = true;
  bool _isArabic = true; 
  bool _showingPushDialog = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadAccounts();
    _initNetwork();
    
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _timeLeft = _repository.remainingSeconds;
        });
      }
    });

    // Push Auth Polling
    _pushTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      _checkForPushRequests();
    });
    
    _pulseController = AnimationController(
        vsync: this, 
        duration: const Duration(seconds: 2),
        lowerBound: 0.95,
        upperBound: 1.05
    )..repeat(reverse: true);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _authenticateUser();
    });
  }

  Future<void> _initNetwork() async {
    final ip = await NetworkManager.getServerIp();
    _apiService.updateBaseUrl(ip);
  }

  void _showSettingsDialog() async {
    debugPrint("Show settings dialog called in OtpScreen");
    try {
      final currentIp = await NetworkManager.getServerIp().timeout(const Duration(seconds: 2), onTimeout: () => NetworkManager.defaultIp);
      final controller = TextEditingController(text: currentIp);
      
      if (!mounted) return;
      
      showDialog(
        context: context,
        builder: (context) => Directionality(
          textDirection: _isArabic ? TextDirection.rtl : TextDirection.ltr,
          child: AlertDialog(
            backgroundColor: const Color(0xFF1E1B4B),
            title: Text(
              _isArabic ? "إعدادات الربط" : "Network Settings",
              style: const TextStyle(color: Colors.white),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: controller,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: _isArabic ? "عنوان IP السيرفر" : "Server IP Address",
                    labelStyle: const TextStyle(color: Colors.white38),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white12)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.blueAccent)),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  _isArabic ? "مثال: 192.168.1.10" : "Example: 192.168.1.10",
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(_isArabic ? "إلغاء" : "Cancel"),
              ),
              ElevatedButton(
                onPressed: () async {
                  await NetworkManager.setServerIp(controller.text);
                  _apiService.updateBaseUrl(controller.text);
                  if (mounted) Navigator.pop(context);
                  _checkForPushRequests(); // Re-trigger check
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent),
                child: Text(_isArabic ? "حفظ" : "Save"),
              ),
            ],
          ),
        ),
      );
    } catch (e) {
      debugPrint("Error opening settings: $e");
    }
  }

  Future<void> _checkForPushRequests() async {
    if (_showingPushDialog) return;
    
    final token = await _repository.getToken();
    if (token == null) return;

    final request = await _apiService.getPendingPushAuth(token);
    if (request['status'] == 'FOUND' && mounted) {
      _showPushAuthDialog(request);
    }
  }

  void _showPushAuthDialog(Map<String, dynamic> request) {
    setState(() => _showingPushDialog = true);
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Directionality(
        textDirection: _isArabic ? TextDirection.rtl : TextDirection.ltr,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: AlertDialog(
            backgroundColor: const Color(0xFF1E1B4B).withOpacity(0.9),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32), side: BorderSide(color: Colors.white.withOpacity(0.1))),
            title: Row(
              children: [
                const Icon(Icons.security, color: Colors.blueAccent),
                const SizedBox(width: 12),
                Text(_isArabic ? "طلب تسجيل دخول" : "Login Request", style: const TextStyle(color: Colors.white)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _isArabic ? "هناك محاولة دخول جديدة لحسابك:" : "A new login attempt was detected:",
                  style: const TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 16),
                _infoRow(Icons.computer, _isArabic ? "المتصفح:" : "Browser:", request['browser'] ?? "Unknown"),
                _infoRow(Icons.location_on, _isArabic ? "العنوان:" : "IP:", request['ip'] ?? "Unknown"),
                const SizedBox(height: 24),
                Text(
                  _isArabic ? "هل تسمح بهذا الدخول؟" : "Do you allow this login?",
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => _respondToPush(request['request_id'], 'DENY'),
                child: Text(_isArabic ? "رفض" : "DENY", style: const TextStyle(color: Colors.redAccent)),
              ),
              ElevatedButton(
                onPressed: () => _respondToPush(request['request_id'], 'APPROVE'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: Text(_isArabic ? "سماح" : "ALLOW", style: const TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    ).then((_) => setState(() => _showingPushDialog = false));
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.white38),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 13)),
          const SizedBox(width: 4),
          Expanded(child: Text(value, style: const TextStyle(color: Colors.white, fontSize: 13), overflow: TextOverflow.ellipsis)),
        ],
      ),
    );
  }

  Future<void> _respondToPush(String requestId, String action) async {
    final token = await _repository.getToken();
    if (token != null) {
      await _apiService.respondPushAuth(token, requestId, action);
    }
    if (mounted) Navigator.pop(context);
  }

  Future<void> _loadAccounts() async {
    final accounts = await _repository.getAccounts();
    if (mounted) {
      setState(() {
        _accounts = accounts;
        _isLoading = false;
      });
    }
  }

  Future<void> _authenticateUser() async {
    final success = await _security.authenticate();
    if (mounted) {
      setState(() {
        _isAuthenticated = success;
        _isCheckingAuth = false;
      });
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    _pushTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _authenticateUser();
    }
  }

  void _handleLogout() async {
    await _repository.clearAll();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  Future<void> _openScanner() async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1B4B),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              _isArabic ? "إضافة حساب" : "Add Account", 
              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)
            ),
            const SizedBox(height: 24),
            ListTile(
              leading: const Icon(Icons.qr_code_scanner, color: Colors.white),
              title: Text(_isArabic ? "مسح رمز QR" : "Scan QR Code", style: const TextStyle(color: Colors.white)),
              onTap: () async {
                Navigator.pop(context);
                final res = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ScannerScreen()),
                );
                if (res == true) _loadAccounts();
              },
            ),
            ListTile(
              leading: const Icon(Icons.edit, color: Colors.white),
              title: Text(_isArabic ? "إدخال يدوي" : "Enter Manually", style: const TextStyle(color: Colors.white)),
              onTap: () => _showManualEntryDialog(),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  void _showManualEntryDialog() {
    Navigator.pop(context);
    final userController = TextEditingController(text: 'Admin');
    final secretController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => Directionality(
        textDirection: _isArabic ? TextDirection.rtl : TextDirection.ltr,
        child: AlertDialog(
          backgroundColor: const Color(0xFF1E1B4B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text(_isArabic ? "إدخال يدوي للمفتاح" : "Manual Secret Entry", style: const TextStyle(color: Colors.white)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: userController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: _isArabic ? "اسم الحساب" : "Account Name", 
                  labelStyle: const TextStyle(color: Colors.white54),
                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white12)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: secretController,
                      style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
                      decoration: InputDecoration(
                        labelText: _isArabic ? "المفتاح السري" : "Secret Key", 
                        labelStyle: const TextStyle(color: Colors.white54),
                        hintText: "EX: JBSW Y3DP...",
                        hintStyle: TextStyle(color: Colors.white10),
                        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white12)),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.paste, color: Colors.blueAccent),
                    onPressed: () async {
                      final data = await Clipboard.getData('text/plain');
                      if (data?.text != null) {
                        secretController.text = data!.text!;
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context), 
              child: Text(_isArabic ? "إلغاء" : "Cancel", style: const TextStyle(color: Colors.white54))
            ),
            ElevatedButton(
              onPressed: () async {
                if (userController.text.isNotEmpty && secretController.text.isNotEmpty) {
                  // Remove spaces if any
                  final cleanSecret = secretController.text.replaceAll(' ', '').toUpperCase();
                  await _repository.saveAccount(userController.text, cleanSecret);
                  if (mounted) {
                    Navigator.pop(context);
                    _loadAccounts();
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent),
              child: Text(_isArabic ? "حفظ وتفعيل" : "Save & Activate"),
            ),
          ],
        ),
      ),
    );
  }

  Future<bool?> _showDeleteConfirmation(String username) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1B4B),
        title: Text(_isArabic ? "حذف الحساب؟" : "Delete Account?", style: const TextStyle(color: Colors.white)),
        content: Text(
          _isArabic ? "هل أنت متأكد من رغبتك في حذف '$username'؟" : "Are you sure you want to remove '$username'?", 
          style: const TextStyle(color: Colors.white70)
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(_isArabic ? "إلغاء" : "Cancel")),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            child: Text(_isArabic ? "حذف" : "Delete", style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: _isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        extendBodyBehindAppBar: true,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: const Text(
            "ZahranTech.Auth",
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          actions: [
            if (widget.username?.toLowerCase() == 'admin' || _accounts.any((a) => a.username.toLowerCase() == 'admin'))
              IconButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Loading settings..."), duration: Duration(milliseconds: 500))
                  );
                  _showSettingsDialog();
                },
                icon: const Icon(Icons.settings, color: Colors.blueAccent),
                tooltip: _isArabic ? "الإعدادات" : "Settings",
              ),
            IconButton(
              onPressed: () => setState(() => _isArabic = !_isArabic),
              icon: const Icon(Icons.language, color: Colors.blueAccent),
              tooltip: _isArabic ? "English" : "العربية",
            ),
            IconButton(
              onPressed: _handleLogout,
              icon: const Icon(Icons.logout, color: Colors.white70),
              tooltip: _isArabic ? "تسجيل الخروج" : "Logout",
            ),
            const SizedBox(width: 8),
          ],
        ),
        body: Stack(
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF020617), Color(0xFF1E1B4B), Color(0xFF312E81)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            
            SafeArea(
              child: Column(
                children: [
                  const SizedBox(height: 10), // Space for AppBar height
                  if (_isLoading)
                    const Expanded(child: Center(child: CircularProgressIndicator(color: Colors.white)))
                  else if (_accounts.isEmpty)
                    Expanded(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.qr_code_scanner, size: 80, color: Colors.white.withOpacity(0.1)),
                            const SizedBox(height: 16),
                            Text(_isArabic ? "لا توجد حسابات مضافة" : "No accounts yet", style: const TextStyle(color: Colors.white54)),
                            const SizedBox(height: 8),
                            Text(_isArabic ? "اضغط على + لإضافة حساب جديد" : "Tap + to scan a QR code", style: const TextStyle(color: Colors.white24, fontSize: 12)),
                          ],
                        ),
                      ),
                    )
                  else
                    Expanded(
                      child: RefreshIndicator(
                        onRefresh: _loadAccounts,
                        color: Colors.white,
                        backgroundColor: const Color(0xFF3B82F6),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                          itemCount: _accounts.length,
                          itemBuilder: (context, index) {
                            final account = _accounts[index];
                            return Dismissible(
                              key: Key(account.username),
                              direction: DismissDirection.endToStart,
                              confirmDismiss: (direction) async {
                                return await _showDeleteConfirmation(account.username);
                              },
                              onDismissed: (direction) {
                                _repository.deleteAccount(account.username);
                                setState(() => _accounts.removeAt(index));
                              },
                              background: Container(
                                alignment: Alignment.centerLeft,
                                padding: const EdgeInsets.only(left: 32),
                                margin: const EdgeInsets.only(bottom: 24),
                                decoration: BoxDecoration(
                                  color: Colors.redAccent.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(32),
                                ),
                                child: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 32),
                              ),
                              child: _buildAccountCard(account),
                            );
                          },
                        ),
                      ),
                    ),
                  
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
        floatingActionButton: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)]),
            boxShadow: [
              BoxShadow(color: const Color(0xFF3B82F6).withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 8)),
            ],
          ),
          child: FloatingActionButton(
            onPressed: _openScanner,
            backgroundColor: Colors.transparent,
            elevation: 0,
            child: const Icon(Icons.add, color: Colors.white, size: 30),
          ),
        ),
      ),
    );
  }

  Widget _buildAccountCard(OtpAccount account) {
    final progress = _timeLeft / 30.0;
    final code = _repository.generateTotp(account.secret);
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(colors: [Colors.blueAccent, Colors.purpleAccent]),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          account.username[0].toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            account.username,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            _isArabic ? "نظام توليد الأكواد" : "TOTP Authenticator",
                            style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        SizedBox(
                          height: 24, width: 24,
                          child: CircularProgressIndicator(
                            value: progress,
                            strokeWidth: 3,
                            backgroundColor: Colors.white.withOpacity(0.05),
                            valueColor: AlwaysStoppedAnimation<Color>(
                              progress < 0.2 ? Colors.redAccent : const Color(0xFF3B82F6)
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text("$_timeLeft", style: const TextStyle(color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                if (_isCheckingAuth)
                  const CircularProgressIndicator(color: Colors.white24)
                else if (!_isAuthenticated)
                  GestureDetector(
                    onTap: _authenticateUser,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.03),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.lock_outline, color: Colors.white.withOpacity(0.3), size: 24),
                          const SizedBox(width: 12),
                          Text(
                            _isArabic ? "اضغط لإظهار الكود" : "Tap to reveal code",
                            style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  GestureDetector(
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: code));
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(_isArabic ? "تم نسخ الكود" : "Code copied to clipboard"), 
                          duration: const Duration(seconds: 1)
                        ),
                      );
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildCodeText(code.substring(0, 3)),
                        const SizedBox(width: 16),
                        _buildCodeText(code.substring(3, 6)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCodeText(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontFamily: 'monospace',
        fontSize: 42,
        fontWeight: FontWeight.bold,
        color: Colors.white,
        letterSpacing: 4,
      ),
    );
  }
}
