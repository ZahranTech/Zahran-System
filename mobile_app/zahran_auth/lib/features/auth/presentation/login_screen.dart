import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/api_service.dart';
import '../../../../core/utils/network_manager.dart';
import '../../otp/presentation/otp_screen.dart';
import '../../otp/domain/otp_repository.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _apiService = ApiService();
  final _otpRepo = OtpRepository();
  
  bool _isLoading = false;
  bool _isArabic = true; 
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _checkExistingSession();
    
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    
    _usernameController.addListener(() {
      setState(() {}); // Rebuild to show/hide settings button
    });
    
    _controller.forward();
  }

  void _showSettingsDialog() async {
    final currentIp = await NetworkManager.getServerIp();
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
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
              },
              child: Text(_isArabic ? "حفظ" : "Save"),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _checkExistingSession() async {
    final accounts = await _otpRepo.getAccounts();
    if (accounts.isNotEmpty && mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const OtpScreen()),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (_usernameController.text.isEmpty || _passwordController.text.isEmpty) {
       ScaffoldMessenger.of(context).showSnackBar(
         SnackBar(content: Text(_isArabic ? "من فضلك أدخل اسم المستخدم وكلمة المرور" : "Please enter username and password")),
       );
       return;
    }

    setState(() => _isLoading = true);
    
    try {
      final loginData = await _apiService.login(
        _usernameController.text, 
        _passwordController.text
      );
      
      if (loginData['tokens'] == null || loginData['tokens']['access'] == null) {
        throw Exception(_isArabic 
          ? "لم يتم استلام مفتاح الدخول بشكل صحيح" 
          : "Access token missing from response");
      }

      await _otpRepo.saveToken(loginData['tokens']['access']);
      
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => OtpScreen(username: _usernameController.text)),
        );
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = e.toString().replaceAll('Exception:', '').trim();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Colors.white),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          errorMsg, 
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // زر نسخ واضح جداً
                ElevatedButton.icon(
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: errorMsg));
                    ScaffoldMessenger.of(context).hideCurrentSnackBar();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(_isArabic ? 'تم النسخ بنجاح ✅' : 'Copied! ✅'),
                        backgroundColor: Colors.green,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  icon: const Icon(Icons.copy, size: 18, color: Colors.red),
                  label: Text(
                    _isArabic ? "نسخ" : "COPY",
                    style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
              ],
            ),
            backgroundColor: Colors.redAccent.shade700,
            duration: const Duration(seconds: 15), // مدة أطول
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            margin: const EdgeInsets.all(12),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
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
          actions: [
            if (_usernameController.text.toLowerCase() == 'admin')
              IconButton(
                onPressed: _showSettingsDialog,
                icon: const Icon(Icons.settings, color: Colors.white70),
                tooltip: _isArabic ? "إعدادات الربط" : "Network Settings",
              ),
            IconButton(
              onPressed: () => setState(() => _isArabic = !_isArabic),
              icon: const Icon(Icons.language, color: Colors.blueAccent),
              tooltip: _isArabic ? "Switch to English" : "تغيير للغة العربية",
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
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(32),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                        child: Container(
                          padding: const EdgeInsets.all(40),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(32),
                            border: Border.all(color: Colors.white.withOpacity(0.1)),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 80, height: 80,
                                margin: const EdgeInsets.only(bottom: 32),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)]),
                                  borderRadius: BorderRadius.circular(24),
                                  boxShadow: [
                                    BoxShadow(color: const Color(0xFF3B82F6).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10)),
                                  ],
                                ),
                                child: const Icon(Icons.shield_rounded, size: 44, color: Colors.white),
                              ),
                              Text(
                                "ZahranTech.Auth",
                                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _isArabic ? "بوابتك الآمنة" : "SECURE ACCESS PORTAL",
                                style: const TextStyle(color: Colors.white38, fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 48),
                              TextField(
                                controller: _usernameController,
                                style: const TextStyle(color: Colors.white),
                                decoration: InputDecoration(
                                  labelText: _isArabic ? "اسم المستخدم" : "Username",
                                  labelStyle: const TextStyle(color: Colors.white38),
                                  prefixIcon: const Icon(Icons.person_outline, color: Colors.white38),
                                  filled: true,
                                  fillColor: Colors.white.withOpacity(0.05),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                                ),
                              ),
                              const SizedBox(height: 20),
                              TextField(
                                controller: _passwordController,
                                obscureText: true,
                                style: const TextStyle(color: Colors.white),
                                decoration: InputDecoration(
                                  labelText: _isArabic ? "كلمة المرور" : "Password",
                                  labelStyle: const TextStyle(color: Colors.white38),
                                  prefixIcon: const Icon(Icons.lock_outline, color: Colors.white38),
                                  filled: true,
                                  fillColor: Colors.white.withOpacity(0.05),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                                ),
                              ),
                              const SizedBox(height: 48),
                              SizedBox(
                                width: double.infinity,
                                height: 60,
                                child: ElevatedButton(
                                  onPressed: _isLoading ? null : _handleLogin,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF3B82F6),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                  ),
                                  child: _isLoading 
                                    ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 3)
                                    : Text(_isArabic ? "تسجيل الدخول" : "SIGN IN", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
