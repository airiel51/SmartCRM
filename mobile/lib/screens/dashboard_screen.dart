import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/whatsapp_launcher.dart';
import '../models/models.dart';

class DashboardScreen extends StatefulWidget {
  final Function(int) onNavigateTab;
  const DashboardScreen({Key? key, required this.onNavigateTab}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;
  List<CustomerModel> _customers = [];
  List<ServiceOrderModel> _services = [];
  List<RetentionAlertModel> _alerts = [];

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);
    final results = await Future.wait([
      ApiService.getCustomers(),
      ApiService.getServices(),
      ApiService.getRetentionAlerts(),
    ]);

    if (mounted) {
      setState(() {
        _customers = results[0] as List<CustomerModel>;
        _services = results[1] as List<ServiceOrderModel>;
        _alerts = results[2] as List<RetentionAlertModel>;
        _isLoading = false;
      });
    }
  }

  void _showCustomerInspector(Map<String, dynamic> c) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Avatar & Name
              Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: const Color(0xFFF59E0B),
                    child: Text(
                      c['initials'] ?? 'PS',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          c['name'] ?? 'Priya Subramaniam',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          c['subtitle'] ?? 'Proton X50 1.5 TGDi (VAB 2020) • Bay 2',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.star_rounded, color: Color(0xFFF59E0B)),
                    onPressed: () {},
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Action Buttons: Call & WhatsApp
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => WhatsAppLauncher.callCustomer(c['phone'] ?? '+60165542190'),
                      icon: const Icon(Icons.call_rounded, size: 16, color: Color(0xFF0F172A)),
                      label: const Text('Call', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: BorderSide(color: Colors.grey.shade300),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => WhatsAppLauncher.openChat(
                        phone: c['phone'] ?? '+60165542190',
                        message: 'Hello ${c['name'] ?? ''}, contacting you from Apex AutoWorks regarding your vehicle.',
                      ),
                      icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16, color: Colors.white),
                      label: const Text('WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Summarize Timeline
              const Text(
                'Summarize',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    _buildMessageRow('10:14 AM', 'PR', 'Priya: Salam Airiel, my Proton X50 plate VAB 2020 has high pitched squeak when I step on brakes.'),
                    const Divider(height: 16),
                    _buildMessageRow('10:15 AM', 'AI', 'SmartCRM AI: NLP Extracted: Plate VAB 2020. Symptom: Brake System Friction. Reserved Bay 2.'),
                    const Divider(height: 16),
                    _buildMessageRow('10:16 AM', 'PIC', 'Airiel (PIC): Waalaikumsalam Priya! Bay 2 is reserved for you at 2:30 PM.'),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Diagnostic Voice Note Waveform
              const Text(
                'Diagnostic Voice Note',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 4),
              Text(
                'WhatsApp Audio: Customer brake squeak recording while braking near Penang Bridge.',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.play_circle_filled_rounded, color: Color(0xFF0F172A), size: 30),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: List.generate(24, (i) {
                          final heights = [8, 14, 22, 16, 28, 12, 18, 24, 10, 30, 20, 16, 26, 14, 8, 22, 18, 28, 12, 20, 14, 10, 16, 8];
                          return Container(
                            width: 3,
                            height: heights[i % heights.length].toDouble(),
                            decoration: BoxDecoration(
                              color: i < 10 ? const Color(0xFF0F172A) : const Color(0xFF94A3B8),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          );
                        }),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text('00:32', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMessageRow(String time, String badge, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 60,
          child: Text(time, style: TextStyle(fontSize: 10, color: Colors.grey.shade500, fontWeight: FontWeight.bold)),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
          decoration: BoxDecoration(
            color: badge == 'AI' ? const Color(0xFF3B82F6) : badge == 'PIC' ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(badge, style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold)),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(text, style: const TextStyle(fontSize: 11.5, color: Color(0xFF1E293B))),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.car_repair_rounded, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Hi, Airiel Hazim',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                ),
                Row(
                  children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                    const SizedBox(width: 4),
                    const Text('SmartCRM • Apex AutoWorks', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF64748B)),
            onPressed: _loadDashboardData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
          : RefreshIndicator(
              onRefresh: _loadDashboardData,
              color: const Color(0xFFF59E0B),
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: [
                  // 1. Horizontal Pastel Metric Cards (Lilac, Sky Blue, Honey)
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildPastelCard(
                          title: 'Fleet Under Care',
                          tag: 'Fleet',
                          value: '186',
                          unit: 'Vehicles',
                          bgColor: const Color(0xFFF5EEFD),
                          borderColor: const Color(0xFFE9D5FF),
                          tagBg: const Color(0xFFEDE9FE),
                          tagTextColor: const Color(0xFF6B21A8),
                          valueColor: const Color(0xFF0F172A),
                          unitColor: const Color(0xFF64748B),
                          onTap: () => widget.onNavigateTab(3),
                        ),
                        const SizedBox(width: 12),
                        _buildPastelCard(
                          title: 'Overdue Retention Scans',
                          tag: 'Scan',
                          value: '2',
                          unit: 'Overdue Alerts',
                          bgColor: const Color(0xFFF0F9FF),
                          borderColor: const Color(0xFFBAE6FD),
                          tagBg: const Color(0xFFE0F2FE),
                          tagTextColor: const Color(0xFF0284C7),
                          valueColor: const Color(0xFF0F172A),
                          unitColor: const Color(0xFFDC2626),
                          onTap: () => widget.onNavigateTab(2),
                        ),
                        const SizedBox(width: 12),
                        _buildPastelCard(
                          title: 'Repeat-Service Rate (CAT405)',
                          tag: 'Bays',
                          value: '74.2%',
                          unit: 'Loyalty Benchmark',
                          bgColor: const Color(0xFFFFFBEB),
                          borderColor: const Color(0xFFFDE68A),
                          tagBg: const Color(0xFFFEF3C7),
                          tagTextColor: const Color(0xFFD97706),
                          valueColor: const Color(0xFF0F172A),
                          unitColor: const Color(0xFF16A34A),
                          onTap: () => widget.onNavigateTab(1),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 2. Workshop Service & Campaign Demand Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Workshop Demand (Penang)',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFCBD5E1)),
                              ),
                              child: const Text('Month ∨', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Stats row: Aug 422 | +127 | Sep 549
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text('Aug, 2026', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                                Text('422', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFECFDF5),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFA7F3D0)),
                              ),
                              child: const Text('+127', style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.w900, fontSize: 13)),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: const [
                                Text('Sep, 2026', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                                Text('549', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        // Flow Banner
                        Container(
                          height: 50,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            gradient: const LinearGradient(
                              colors: [Color(0xFFFEF3C7), Color(0xFFE0F2FE), Color(0xFFF3E8FF)],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: const [
                              Text('Notice: 540', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                              Text('Receipts: 138', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                              Text('Reminders: 371', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // 3. Workshop Inquiries & Feed Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'LIVE INBOUND & WORKSHOP FEED',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8),
                      ),
                      TextButton(
                        onPressed: () => widget.onNavigateTab(1),
                        child: const Text('View Bays ➔', style: TextStyle(color: Color(0xFFD97706), fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // 4. Activity Rows (Priya, Michael, Ahmad, Wei Ming)
                  _buildFeedCard(
                    type: 'WhatsApp',
                    typeColor: const Color(0xFFEDE9FE),
                    typeTextColor: const Color(0xFF6B21A8),
                    phone: '+60 16-554 2190',
                    name: 'Priya Subramaniam',
                    plate: 'VAB 2020',
                    destination: 'Apex AutoWorks PIC',
                    status: 'In Bay 2',
                    statusColor: const Color(0xFF10B981),
                    time: 'Today, 2:02 PM',
                    onTap: () => _showCustomerInspector({
                      'initials': 'PS',
                      'name': 'Priya Subramaniam',
                      'subtitle': 'Proton X50 1.5 TGDi (VAB 2020) • Bay 2',
                      'phone': '+60165542190',
                    }),
                  ),
                  _buildFeedCard(
                    type: 'WhatsApp',
                    typeColor: const Color(0xFF0F172A),
                    typeTextColor: Colors.white,
                    phone: '+60 19-411 9832',
                    name: 'Michael Wong',
                    plate: 'JRS 7731',
                    destination: 'Apex AutoWorks PIC',
                    status: 'In Bay 3',
                    statusColor: const Color(0xFFF59E0B),
                    time: 'Today, 2:34 PM',
                    onTap: () => _showCustomerInspector({
                      'initials': 'MW',
                      'name': 'Michael Wong',
                      'subtitle': 'Toyota Vios 1.5G (JRS 7731) • Bay 3',
                      'phone': '+60194119832',
                    }),
                  ),
                  _buildFeedCard(
                    type: 'Retention',
                    typeColor: const Color(0xFFFEE2E2),
                    typeTextColor: const Color(0xFFDC2626),
                    phone: '+60 12-345 6789',
                    name: 'Ahmad Razali',
                    plate: 'WXY 8821',
                    destination: 'Autonomous Retention AI',
                    status: 'Overdue Alert',
                    statusColor: const Color(0xFFDC2626),
                    time: 'Today, 1:50 PM',
                    onTap: () => _showCustomerInspector({
                      'initials': 'AR',
                      'name': 'Ahmad Razali',
                      'subtitle': 'Perodua Myvi 1.5 AV (WXY 8821) • Overdue',
                      'phone': '+60123456789',
                    }),
                  ),
                  _buildFeedCard(
                    type: 'WhatsApp',
                    typeColor: const Color(0xFF0F172A),
                    typeTextColor: Colors.white,
                    phone: '+60 17-882 1902',
                    name: 'Tan Wei Ming',
                    plate: 'PNG 4419',
                    destination: 'Apex AutoWorks PIC',
                    status: 'Confirmed',
                    statusColor: const Color(0xFF10B981),
                    time: 'Today, 7:54 AM',
                    onTap: () => _showCustomerInspector({
                      'initials': 'WM',
                      'name': 'Tan Wei Ming',
                      'subtitle': 'Honda Civic RS (PNG 4419) • Confirmed',
                      'phone': '+60178821902',
                    }),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildPastelCard({
    required String title,
    required String tag,
    required String value,
    required String unit,
    required Color bgColor,
    required Color borderColor,
    required Color tagBg,
    required Color tagTextColor,
    required Color valueColor,
    required Color unitColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 170,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor, width: 1.2),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: tagBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(tag, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: tagTextColor)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              value,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: valueColor),
            ),
            const SizedBox(height: 2),
            Text(
              unit,
              style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: unitColor),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedCard({
    required String type,
    required Color typeColor,
    required Color typeTextColor,
    required String phone,
    required String name,
    required String plate,
    required String destination,
    required String status,
    required Color statusColor,
    required String time,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
        ],
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        leading: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: typeColor,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            type,
            style: TextStyle(color: typeTextColor, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                plate,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 0.5),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                name,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 3),
          child: Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 4),
              Text(
                status,
                style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              Text(
                time,
                style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
        trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFFCBD5E1), size: 20),
      ),
    );
  }
}
