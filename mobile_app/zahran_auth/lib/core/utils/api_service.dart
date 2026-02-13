import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'network_manager.dart';

class ApiService {
  Dio _dio;
  
  ApiService() : _dio = Dio(BaseOptions(
          baseUrl: 'https://zahran-backend.onrender.com/api', // Production fallback
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          headers: {'Content-Type': 'application/json'},
        )) {
    _init();
  }

  Future<void> _init() async {
    final ip = await NetworkManager.getServerIp();
    updateBaseUrl(ip);
  }

  void updateBaseUrl(String ip) {
    final url = NetworkManager.getBaseUrl(ip);
    _dio.options.baseUrl = url;
    debugPrint("BASE URL UPDATED TO: $url");
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login/', 
        data: {
          'username': username,
          'password': password,
        },
        options: Options(headers: {'X-Is-Mobile': 'true'}),
      );
      return response.data;
    } on DioException catch (e) {
      debugPrint('❌ Login API Error:');
      debugPrint('   Status: ${e.response?.statusCode}');
      debugPrint('   Data: ${e.response?.data}');
      debugPrint('   Message: ${e.message}');

      if (e.response != null) {
        String msg = e.response?.data['detail'] ?? 
                     e.response?.data['error'] ?? 
                     'Login failed (${e.response?.statusCode})';
        throw Exception(msg);
      } else {
        throw Exception('Network error: ${e.message} \nCheck your internet connection.');
      }
    }
  }

  Future<Map<String, dynamic>> setup2FA(String token) async {
    try {
      final response = await _dio.get(
        '/auth/setup-2fa/',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Failed to setup 2FA');
    }
  }

  Future<Map<String, dynamic>> syncDevice(String token) async {
    try {
      final response = await _dio.get(
        '/auth/sync-device/',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Failed to sync device');
    }
  }

  Future<Map<String, dynamic>> getPendingPushAuth(String token) async {
    try {
      final response = await _dio.get(
        '/auth/push-auth/pending/',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.data;
    } catch (e) {
       return {"status": "NO_REQUESTS"};
    }
  }

  Future<void> respondPushAuth(String token, String requestId, String action) async {
    try {
      await _dio.post(
        '/auth/push-auth/respond/',
        data: {'request_id': requestId, 'action': action},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } catch (e) {
      debugPrint("Error responding to push auth: $e");
    }
  }
}
