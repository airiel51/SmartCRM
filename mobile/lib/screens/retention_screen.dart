import 'package:flutter/material.dart';
import '../services/api_service.dart';
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

  Future<void> _sendReminder(RetentionAlertModel alert) async {
    final ok = await ApiService.sendRetentionReminder(alert);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ WhatsApp reminder dispatched to ${alert.customerName} (${alert.phone})!'),
          backgroundColor: Colors.green.shade700,
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
        title: const Text('Autonomous Retention Engine', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: _loadAlerts,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Info Banner
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.purple.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.purpleAccent.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.auto_awesome_rounded, color: Colors.purpleAccent, size: 24),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Agentic Scanner monitors vehicle mileage vs 5k/10k/20k/40k thresholds. Dispatches proactive WhatsApp reminders before churn occurs.',
                          style: TextStyle(color: Colors.white, fontSize: 12, height: 1.3),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'OVERDUE FLEET INTERVENTIONS',
                      style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                    ),
                    Text(
                      '${_alerts.length} Actionable',
                      style: const TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                if (_alerts.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Center(
                      child: Text('All customer vehicles are within valid service intervals.', style: TextStyle(color: Colors.white60)),
                    ),
                  )
                else
                  ..._alerts.map((a) => _buildAlertCard(a)).toList(),
              ],
            ),
    );
  }

  Widget _buildAlertCard(RetentionAlertModel alert) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        alert.plateNumber,
                        style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 13),
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
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${alert.daysOverdue}d overdue',
                    style: const TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Owner: ${alert.customerName} • ${alert.phone}',
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 2),
            Text(
              'Current Odometer: ${alert.currentMileage} km (+${alert.kmOverdue} km past interval)',
              style: const TextStyle(color: Colors.white54, fontSize: 11),
            ),

            const SizedBox(height: 12),

            // AI WhatsApp Draft
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.chat_bubble_outline_rounded, color: Colors.greenAccent, size: 14),
                      SizedBox(width: 6),
                      Text(
                        'AI Generated WhatsApp Reminder Draft',
                        style: TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    alert.reminderDraft,
                    style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.3),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Send Button
            ElevatedButton.icon(
              onPressed: () => _sendReminder(alert),
              icon: const Icon(Icons.send_rounded, size: 16, color: Colors.black87),
              label: const Text('Send WhatsApp Retention Notice', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 12)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.greenAccent,
                minimumSize: const Size(double.infinity, 42),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
