import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF3B82F6); // Blue-500
  static const Color secondary = Color(0xFF8B5CF6); // Violet-500
  static const Color background = Color(0xFF0F172A); // Slate-900
  static const Color surface = Color(0xFF1E293B); // Slate-800
  
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Colors.white70;
  
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient bgGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E293B), Color(0xFF312E81)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
