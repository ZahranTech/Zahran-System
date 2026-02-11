import 'dart:async';
import 'dart:convert';
import 'package:otp/otp.dart';
import 'package:flutter/foundation.dart';
import 'dart:html' as html;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class OtpAccount {
  final String username;
  final String secret;

  OtpAccount({required this.username, required this.secret});

  Map<String, dynamic> toJson() => {
    'username': username,
    'secret': secret,
  };

  factory OtpAccount.fromJson(Map<String, dynamic> json) => OtpAccount(
    username: json['username'],
    secret: json['secret'],
  );
}

class OtpRepository {
  final _storage = const FlutterSecureStorage();
  static const _accountsKey = 'zahran_auth_accounts_list';

  Future<void> saveAccount(String username, String secret) async {
    List<OtpAccount> accounts = await getAccounts();
    // Check if account already exists, update if it does
    int index = accounts.indexWhere((a) => a.username == username);
    if (index != -1) {
      accounts[index] = OtpAccount(username: username, secret: secret);
    } else {
      accounts.add(OtpAccount(username: username, secret: secret));
    }
    
    final encoded = jsonEncode(accounts.map((a) => a.toJson()).toList());
    
    if (kIsWeb) {
      html.window.localStorage[_accountsKey] = encoded;
    } else {
      await _storage.write(key: _accountsKey, value: encoded);
    }
  }

  Future<void> saveSecret(String username, String secret) async {
    await saveAccount(username, secret);
  }

  Future<List<OtpAccount>> getAccounts() async {
    String? encoded;
    if (kIsWeb) {
      encoded = html.window.localStorage[_accountsKey];
    } else {
      encoded = await _storage.read(key: _accountsKey);
    }

    if (encoded == null) return [];
    
    try {
      final List<dynamic> decoded = jsonDecode(encoded);
      return decoded.map((item) => OtpAccount.fromJson(item)).toList();
    } catch (e) {
      return [];
    }
  }

  // Backward compatibility methods for existing single account logic
  Future<String?> getSecret() async {
    final accounts = await getAccounts();
    if (accounts.isNotEmpty) return accounts.first.secret;
    return null;
  }
  
  Future<String?> getUsername() async {
    final accounts = await getAccounts();
    if (accounts.isNotEmpty) return accounts.first.username;
    return null;
  }

  static const _tokenKey = 'zahran_auth_session_token';

  Future<void> saveToken(String token) async {
    if (kIsWeb) {
      html.window.localStorage[_tokenKey] = token;
    } else {
      await _storage.write(key: _tokenKey, value: token);
    }
  }

  Future<String?> getToken() async {
    if (kIsWeb) {
      return html.window.localStorage[_tokenKey];
    }
    return await _storage.read(key: _tokenKey);
  }

  Future<void> clearAll() async {
    if (kIsWeb) {
      html.window.localStorage.remove(_accountsKey);
      html.window.localStorage.remove(_tokenKey);
    } else {
      await _storage.delete(key: _accountsKey);
      await _storage.delete(key: _tokenKey);
    }
  }

  Future<void> deleteAccount(String username) async {
    List<OtpAccount> accounts = await getAccounts();
    accounts.removeWhere((a) => a.username == username);
    
    final encoded = jsonEncode(accounts.map((a) => a.toJson()).toList());
    if (kIsWeb) {
      html.window.localStorage[_accountsKey] = encoded;
    } else {
      await _storage.write(key: _accountsKey, value: encoded);
    }
  }

  String generateTotp(String secret) {
    return OTP.generateTOTPCodeString(
      secret,
      DateTime.now().millisecondsSinceEpoch,
      algorithm: Algorithm.SHA1,
      isGoogle: true,
    );
  }
  
  int get remainingSeconds {
    final now = DateTime.now().millisecondsSinceEpoch;
    return 30 - ((now ~/ 1000) % 30);
  }
}
