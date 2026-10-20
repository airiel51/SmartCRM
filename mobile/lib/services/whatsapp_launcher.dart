import 'package:url_launcher/url_launcher.dart';

class WhatsAppLauncher {
  /// Opens WhatsApp on Android/iOS/Web with the specified phone and message
  static Future<bool> openChat({required String phone, required String message}) async {
    // Sanitize phone number (remove +, spaces, dashes)
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    
    // Add Malaysia country code 60 if starts with 0
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '60${cleanPhone.substring(1)}';
    } else if (!cleanPhone.startsWith('60') && cleanPhone.length <= 10) {
      cleanPhone = '60$cleanPhone';
    }

    final encodedMsg = Uri.encodeComponent(message);
    
    // 1. Try whatsapp deep link scheme
    final whatsappUri = Uri.parse('whatsapp://send?phone=$cleanPhone&text=$encodedMsg');
    // 2. Fallback to universal web link
    final waMeUri = Uri.parse('https://wa.me/$cleanPhone?text=$encodedMsg');

    try {
      if (await canLaunchUrl(whatsappUri)) {
        return await launchUrl(whatsappUri, mode: LaunchMode.externalApplication);
      } else {
        return await launchUrl(waMeUri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      // In case native app fails, launch browser fallback
      try {
        return await launchUrl(waMeUri, mode: LaunchMode.externalApplication);
      } catch (_) {
        return false;
      }
    }
  }

  /// Launch phone call
  static Future<bool> makePhoneCall(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final telUri = Uri.parse('tel:$cleanPhone');
    try {
      if (await canLaunchUrl(telUri)) {
        return await launchUrl(telUri);
      }
      return false;
    } catch (_) {
      return false;
    }
  }
}
