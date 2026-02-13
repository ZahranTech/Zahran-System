import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';

class NetworkManager {
  static const String _kServerIpKey = 'server_ip';
  static const String defaultIp = 'https://zahran-backend.onrender.com';
  static const _storage = FlutterSecureStorage();
  static String? _cachedIp;

  static Future<String> getServerIp() async {
    if (_cachedIp != null) return _cachedIp!;
    if (kIsWeb) return defaultIp; // Fallback for now if storage hangs on web
    try {
      String? ip = await _storage.read(key: _kServerIpKey);
      _cachedIp = ip ?? defaultIp;
      return _cachedIp!;
    } catch (e) {
      return defaultIp;
    }
  }

  static Future<void> setServerIp(String ip) async {
    _cachedIp = ip;
    if (kIsWeb) return;
    try {
      await _storage.write(key: _kServerIpKey, value: ip);
    } catch (e) {
      debugPrint("Storage error: $e");
    }
  }

  static String getBaseUrl(String ip) {
    if (ip.startsWith('http')) {
      return ip.endsWith('/') ? '${ip}api' : '$ip/api';
    }
    // If IP is just a domain (e.g. zahran-backend.onrender.com)
    if (!ip.contains(':')) {
       return 'https://$ip/api';
    }
    return 'http://$ip:8000/api';
  }
}
