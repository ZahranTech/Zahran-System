import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/security_service.dart';
import 'features/auth/presentation/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await SecurityService().initSecurity();
  } catch (e) {
    debugPrint("Security Init Error: $e");
  }
  
  runApp(
    const ProviderScope(
      child: ZahranAuthApp(),
    ),
  );
}

class ZahranAuthApp extends StatelessWidget {
  const ZahranAuthApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ZahranTech.Auth',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const LoginScreen(),
    );
  }
}
