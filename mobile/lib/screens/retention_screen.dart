import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/whatsapp_launcher.dart';
import '../models/models.dart';

class RetentionScreen extends StatefulWidget {
  const RetentionScreen({Key? key}) : super(key: key);

  @override
  State<RetentionScreen> createState() => _RetentionScreenState();
}

class _RetentionScreenState extends State<RetentionScreen> {
  bool _isLoading = true;
  List<RetentionAlertModel> _alerts = [];

  @override
  void initState() {
    super.initState();
    _loadAlerts();
  }

  Future<void> _loadAlerts() async {
    setState(() => _isLoading = true);
    final list = await ApiService.getRetentionAlerts();
    if (mounted) {
      setState(() {
        _alerts = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _sendWhatsAppReminder(RetentionAlertModel alert) async {
    // 1. Log in database
    await ApiService.sendRetentionReminder(alert);

    // 2. Open real WhatsApp application on the device
    final launched = await WhatsAppLauncher.openChat(
      phone: alert.phone,
      message: alert.reminderDraft,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            launched
                ? 'Opening WhatsApp for ${alert.customerName}...'
                : 'Reminder recorded for ${alert.customerName} (${alert.phone})',
          ),
          backgroundColor: const Color(0xFF10B981),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'WhatsApp Reminders',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            Text(
              '${_alerts.length} overdue vehicle reminders ready',
              style: const TextStyle(fontSize: 12, color: Colors.amber, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: _loadAlerts,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : RefreshIndicator(
              onRefresh: _loadAlerts,
              color: Colors.amber,
              child: _alerts.isEmpty
                  ? const Center(
                      child: Text(
                        'All customer vehicles are up to date!',
                        style: TextStyle(color: Colors.white60, fontSize: 14),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      itemCount: _alerts.length,
                      itemBuilder: (context, idx) {
                        final item = _alerts[idx];
                        return _buildReminderCard(item);
                      },
                    ),
            ),
    );
  }

  Widget _buildReminderCard(RetentionAlertModel alert) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Plate & Overdue Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: Colors.white24),
                      ),
                      child: Text(
                        alert.plateNumber,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      alert.vehicleName,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${alert.daysOverdue}d overdue',
                    style: const TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Customer Name & Phone
            Text(
              '${alert.customerName} • ${alert.phone}',
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),

            const SizedBox(height: 10),

            // Short Message Preview
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                alert.reminderDraft,
                style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.3),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),

            const SizedBox(height: 12),

            // Big Direct WhatsApp Button
            SizedBox(
              width: double.infinity,
              height: 42,
              child: ElevatedButton.icon(
                onPressed: () => _sendWhatsAppReminder(alert),
                icon: const Icon(Icons.chat_rounded, color: Colors.white, size: 16),
                label: const Text(
                  'Open WhatsApp Chat',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
