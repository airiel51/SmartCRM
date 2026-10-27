import 'dart:async';
import 'dart:math' as math;
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

class _DashboardScreenState extends State<DashboardScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  List<CustomerModel> _customers = [];
  List<ServiceOrderModel> _services = [];
  List<RetentionAlertModel> _alerts = [];
  late AnimationController _entranceCtrl;

  @override
  void initState() {
    super.initState();
    _entranceCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _loadDashboardData();
  }

  @override
  void dispose() {
    _entranceCtrl.dispose();
    super.dispose();
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
      _entranceCtrl.forward(from: 0);
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
              // Avatar & Name with scale effect
              Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: const Color(0xFF0F172A),
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
              // Action Buttons: Call & WhatsApp with tactile spring
              Row(
                children: [
                  Expanded(
                    child: BouncingTouchCard(
                      onTap: () => WhatsAppLauncher.callCustomer(c['phone'] ?? '+60165542190'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.call_rounded, size: 16, color: Color(0xFF0F172A)),
                            SizedBox(width: 6),
                            Text('Call', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: BouncingTouchCard(
                      onTap: () => WhatsAppLauncher.openChat(
                        phone: c['phone'] ?? '+60165542190',
                        message: 'Hello ${c['name'] ?? ''}, contacting you from Apex AutoWorks regarding your vehicle.',
                      ),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981),
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(color: const Color(0xFF10B981).withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 3)),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.chat_bubble_outline_rounded, size: 16, color: Colors.white),
                            SizedBox(width: 6),
                            Text('WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          ],
                        ),
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
              // Live Interactive Animated Diagnostic Voice Note Player!
              const AnimatedDiagnosticWaveform(),
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
                  children: const [
                    PulsingDot(color: Color(0xFF10B981), size: 6),
                    SizedBox(width: 6),
                    Text('SmartCRM • Apex AutoWorks', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
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
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
                children: [
                  // 1. Horizontal Pastel Metric Cards (Lilac, Sky Blue, Honey) with Entrance Slide
                  SlideTransition(
                    position: Tween<Offset>(begin: const Offset(0.2, 0), end: Offset.zero).animate(
                      CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOutCubic),
                    ),
                    child: FadeTransition(
                      opacity: _entranceCtrl,
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildPastelCard(
                              title: 'Fleet Under Care',
                              tag: 'Fleet',
                              value: '186',
                              unit: 'Vehicles',
                              bgColor: Colors.white,
                              borderColor: const Color(0xFFE2E8F0),
                              tagBg: const Color(0xFFF1F5F9),
                              tagTextColor: const Color(0xFF475569),
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
                              bgColor: Colors.white,
                              borderColor: const Color(0xFFE2E8F0),
                              tagBg: const Color(0xFFFEF2F2),
                              tagTextColor: const Color(0xFF991B1B),
                              valueColor: const Color(0xFF0F172A),
                              unitColor: const Color(0xFF991B1B),
                              onTap: () => widget.onNavigateTab(2),
                            ),
                            const SizedBox(width: 12),
                            _buildPastelCard(
                              title: 'Repeat-Service Rate',
                              tag: 'Bays',
                              value: '74.2%',
                              unit: 'Loyalty Benchmark',
                              bgColor: Colors.white,
                              borderColor: const Color(0xFFE2E8F0),
                              tagBg: const Color(0xFFF0FDF4),
                              tagTextColor: const Color(0xFF166534),
                              valueColor: const Color(0xFF0F172A),
                              unitColor: const Color(0xFF166534),
                              onTap: () => widget.onNavigateTab(1),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 2. Workshop Service & Campaign Demand Card
                  SlideTransition(
                    position: Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
                      CurvedAnimation(parent: _entranceCtrl, curve: const Interval(0.2, 1.0, curve: Curves.easeOutCubic)),
                    ),
                    child: FadeTransition(
                      opacity: _entranceCtrl,
                      child: Container(
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
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: const Text('+127', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w800, fontSize: 13)),
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
                            // Live Bay Capacity Meter
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: const [
                                          Icon(Icons.garage_rounded, size: 16, color: Color(0xFF0F172A)),
                                          SizedBox(width: 6),
                                          Text('Live Bay Occupancy: 75%', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: Color(0xFF0F172A))),
                                        ],
                                      ),
                                      const Text('3 of 4 Active', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w800, fontSize: 11)),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(6),
                                    child: SizedBox(
                                      height: 8,
                                      child: Row(
                                        children: [
                                          Expanded(flex: 1, child: Container(color: const Color(0xFF0F172A))),
                                          const SizedBox(width: 2),
                                          Expanded(flex: 1, child: Container(color: const Color(0xFF334155))),
                                          const SizedBox(width: 2),
                                          Expanded(flex: 1, child: Container(color: const Color(0xFF64748B))),
                                          const SizedBox(width: 2),
                                          Expanded(flex: 1, child: Container(color: const Color(0xFFE2E8F0))),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: const [
                                      Text('Bay 1: Service', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                                      Text('Bay 2: Brakes', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                                      Text('Bay 3: Aircond', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                                      Text('Bay 4: Standby', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 14),

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
                        child: const Text('View Bays ➔', style: TextStyle(color: Color(0xFF0F172A), fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // 4. Staggered Animated Activity Rows (Priya, Michael, Ahmad, Wei Ming)
                  _buildFeedCard(
                    index: 0,
                    type: 'WhatsApp',
                    typeColor: const Color(0xFFF1F5F9),
                    typeTextColor: const Color(0xFF334155),
                    phone: '+60 16-554 2190',
                    name: 'Priya Subramaniam',
                    plate: 'VAB 2020',
                    destination: 'Apex AutoWorks PIC',
                    status: 'In Bay 2',
                    statusColor: const Color(0xFF334155),
                    time: 'Today, 2:02 PM',
                    onTap: () => _showCustomerInspector({
                      'initials': 'PS',
                      'name': 'Priya Subramaniam',
                      'subtitle': 'Proton X50 1.5 TGDi (VAB 2020) • Bay 2',
                      'phone': '+60165542190',
                    }),
                  ),
                  _buildFeedCard(
                    index: 1,
                    type: 'WhatsApp',
                    typeColor: const Color(0xFFF1F5F9),
                    typeTextColor: const Color(0xFF334155),
                    phone: '+60 19-411 9832',
                    name: 'Michael Wong',
                    plate: 'JRS 7731',
                    destination: 'Apex AutoWorks PIC',
                    status: 'In Bay 3',
                    statusColor: const Color(0xFF475569),
                    time: 'Today, 2:34 PM',
                    onTap: () => _showCustomerInspector({
                      'initials': 'MW',
                      'name': 'Michael Wong',
                      'subtitle': 'Toyota Vios 1.5G (JRS 7731) • Bay 3',
                      'phone': '+60194119832',
                    }),
                  ),
                  _buildFeedCard(
                    index: 2,
                    type: 'Retention',
                    typeColor: const Color(0xFFFEF2F2),
                    typeTextColor: const Color(0xFF991B1B),
                    phone: '+60 12-345 6789',
                    name: 'Ahmad Razali',
                    plate: 'WXY 8821',
                    destination: 'Service Reminder',
                    status: 'Overdue Alert',
                    statusColor: const Color(0xFF991B1B),
                    time: 'Today, 1:50 PM',
                    onTap: () => _showCustomerInspector({
                      'initials': 'AR',
                      'name': 'Ahmad Razali',
                      'subtitle': 'Perodua Myvi 1.5 AV (WXY 8821) • Overdue',
                      'phone': '+60123456789',
                    }),
                  ),
                  _buildFeedCard(
                    index: 3,
                    type: 'WhatsApp',
                    typeColor: const Color(0xFFF1F5F9),
                    typeTextColor: const Color(0xFF334155),
                    phone: '+60 17-882 1902',
                    name: 'Tan Wei Ming',
                    plate: 'PNG 4419',
                    destination: 'Apex AutoWorks PIC',
                    status: 'Confirmed',
                    statusColor: const Color(0xFF166534),
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
    return BouncingTouchCard(
      onTap: onTap,
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
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: valueColor),
              ),
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
    required int index,
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
    final start = 0.3 + (index * 0.1);
    final curve = CurvedAnimation(
      parent: _entranceCtrl,
      curve: Interval(start.clamp(0.0, 1.0), 1.0, curve: Curves.easeOutCubic),
    );

    return SlideTransition(
      position: Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(curve),
      child: FadeTransition(
        opacity: curve,
        child: BouncingTouchCard(
          onTap: onTap,
          child: Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Row(
                children: [
                  Container(
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
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
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
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            PulsingDot(color: statusColor, size: 6),
                            const SizedBox(width: 6),
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
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.chevron_right_rounded, color: Color(0xFFCBD5E1), size: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ==============================================================================
// Micro-interaction Widgets: BouncingTouchCard, PulsingDot, AnimatedDiagnosticWaveform
// ==============================================================================

class BouncingTouchCard extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  const BouncingTouchCard({Key? key, required this.child, this.onTap}) : super(key: key);

  @override
  State<BouncingTouchCard> createState() => _BouncingTouchCardState();
}

class _BouncingTouchCardState extends State<BouncingTouchCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap?.call();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedScale(
        scale: _isPressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 140),
        curve: Curves.easeOutBack,
        child: widget.child,
      ),
    );
  }
}

class PulsingDot extends StatefulWidget {
  final Color color;
  final double size;
  const PulsingDot({Key? key, this.color = const Color(0xFF10B981), this.size = 6}) : super(key: key);

  @override
  State<PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<PulsingDot> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scaleAnim;
  late Animation<double> _glowAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat(reverse: true);
    _scaleAnim = Tween<double>(begin: 0.85, end: 1.25).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
    _glowAnim = Tween<double>(begin: 2.0, end: 6.0).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (context, _) {
        return Container(
          width: widget.size * _scaleAnim.value,
          height: widget.size * _scaleAnim.value,
          decoration: BoxDecoration(
            color: widget.color,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: widget.color.withOpacity(0.55),
                blurRadius: _glowAnim.value,
                spreadRadius: _glowAnim.value / 3,
              ),
            ],
          ),
        );
      },
    );
  }
}

class AnimatedDiagnosticWaveform extends StatefulWidget {
  const AnimatedDiagnosticWaveform({Key? key}) : super(key: key);

  @override
  State<AnimatedDiagnosticWaveform> createState() => _AnimatedDiagnosticWaveformState();
}

class _AnimatedDiagnosticWaveformState extends State<AnimatedDiagnosticWaveform> with SingleTickerProviderStateMixin {
  late AnimationController _waveCtrl;
  bool _isPlaying = false;
  int _seconds = 0;
  Timer? _timer;

  final List<double> _baseHeights = [8, 14, 22, 16, 28, 12, 18, 24, 10, 30, 20, 16, 26, 14, 8, 22, 18, 28, 12, 20, 14, 10, 16, 8];

  @override
  void initState() {
    super.initState();
    _waveCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 550));
  }

  @override
  void dispose() {
    _waveCtrl.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _togglePlay() {
    setState(() {
      _isPlaying = !_isPlaying;
      if (_isPlaying) {
        _waveCtrl.repeat(reverse: true);
        _timer?.cancel();
        _timer = Timer.periodic(const Duration(seconds: 1), (t) {
          if (mounted) {
            setState(() {
              if (_seconds < 32) {
                _seconds++;
              } else {
                _isPlaying = false;
                _waveCtrl.stop();
                _timer?.cancel();
              }
            });
          }
        });
      } else {
        _waveCtrl.stop();
        _timer?.cancel();
      }
    });
  }

  void _restart() {
    setState(() {
      _seconds = 0;
      _isPlaying = true;
      _waveCtrl.repeat(reverse: true);
      _timer?.cancel();
      _timer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (mounted) {
          setState(() {
            if (_seconds < 32) {
              _seconds++;
            } else {
              _isPlaying = false;
              _waveCtrl.stop();
              _timer?.cancel();
            }
          });
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final playedRatio = (_seconds / 32).clamp(0.0, 1.0);
    final playedBarsCount = (playedRatio * _baseHeights.length).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Diagnostic Voice Note',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            GestureDetector(
              onTap: _restart,
              child: const Text(
                'Restart',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706)),
              ),
            ),
          ],
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
              GestureDetector(
                onTap: _togglePlay,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: _isPlaying ? const Color(0xFF10B981) : const Color(0xFF0F172A),
                    shape: BoxShape.circle,
                    boxShadow: [
                      if (_isPlaying)
                        BoxShadow(color: const Color(0xFF10B981).withOpacity(0.4), blurRadius: 8, spreadRadius: 2),
                    ],
                  ),
                  child: Icon(
                    _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: AnimatedBuilder(
                  animation: _waveCtrl,
                  builder: (context, _) {
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: List.generate(_baseHeights.length, (i) {
                        final isPlayed = i <= playedBarsCount;
                        double h = _baseHeights[i];
                        if (_isPlaying) {
                          // Real dynamic modulation
                          final phase = (i * 0.4) + (_waveCtrl.value * math.pi * 2);
                          final modulation = (math.sin(phase) + 1.0) / 2.0; // 0.0 to 1.0
                          h = 6 + (modulation * (_baseHeights[i] - 6));
                        }

                        return Container(
                          width: 3.2,
                          height: h,
                          decoration: BoxDecoration(
                            color: isPlayed ? const Color(0xFF0F172A) : const Color(0xFF94A3B8),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        );
                      }),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '00:${_seconds.toString().padLeft(2, '0')}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}


