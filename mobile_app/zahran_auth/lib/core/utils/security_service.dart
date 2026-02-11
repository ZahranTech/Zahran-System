import 'package:local_auth/local_auth.dart';
import 'package:privacy_screen/privacy_screen.dart';
import 'package:flutter/foundation.dart';

class SecurityService {
  final LocalAuthentication _auth = LocalAuthentication();

  Future<void> initSecurity() async {
    if (kIsWeb) return; // Privacy screen usually doesn't work on web
    
    try {
      // Prevent screenshots and screen recording
      await PrivacyScreen.instance.enable();
    } catch (e) {
      debugPrint("Privacy Screen setup failed: $e");
    }
  }

  Future<bool> authenticate() async {
    // If on web or no biometrics, just return true
    if (kIsWeb) return true;

    try {
      final bool canAuthenticateWithBiometrics = await _auth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _auth.isDeviceSupported();

      if (!canAuthenticate) return true;

      return await _auth.authenticate(
        localizedReason: 'Please authenticate to view your OTP codes',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false, // fallback to PIN/Passcode
        ),
      );
    } catch (e) {
      return false;
    }
  }
}
