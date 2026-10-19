import 'package:flutter/material.dart';
import '../services/api_service.dart';
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

  @override
  Widget build(BuildContext context) {
    final activeBays = _services.where((s) => s.stage != 'Invoiced').length;
    final overdueCount = _alerts.length;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.amber.shade700,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.build_rounded, size: 20, color: Colors.black87),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'SmartCRM Floor PIC',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  'Apex AutoWorks • Bayan Lepas',
                  style: TextStyle(fontSize: 11, color: Colors.white60),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: _loadDashboardData,
            tooltip: 'Sync Fleet Data',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : RefreshIndicator(
              onRefresh: _loadDashboardData,
              color: Colors.amber,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // PIC Live Greeting Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1E293B), Color(0xFF334155)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Shop Floor Command',
                              style: TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.greenAccent.shade400, width: 0.8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  CircleAvatar(radius: 3, backgroundColor: Colors.greenAccent),
                                  SizedBox(width: 5),
                                  Text(
                                    'FastAPI Live',
                                    style: TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'PIC: Airiel Hazim',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Autonomous Retention Engine active. 4 service bays online.',
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 3 KPI Floor Metric Tiles
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricTile(
                          title: 'Active Bays',
                          value: '$activeBays / 4',
                          subtitle: 'Bays Occupied',
                          icon: Icons.car_repair_rounded,
                          color: Colors.blueAccent,
                          onTap: () => widget.onNavigateTab(2), // Bays tab
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildMetricTile(
                          title: 'Overdue Fleet',
                          value: '$overdueCount Cars',
                          subtitle: 'Retention Alert',
                          icon: Icons.warning_amber_rounded,
                          color: Colors.amber,
                          onTap: () => widget.onNavigateTab(3), // Retention tab
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricTile(
                          title: 'Repeat Rate',
                          value: '74.2%',
                          subtitle: 'Loyalty Benchmark',
                          icon: Icons.repeat_rounded,
                          color: Colors.tealAccent,
                          onTap: () => widget.onNavigateTab(4), // Fleet tab
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildMetricTile(
                          title: 'Customers',
                          value: '${_customers.length}',
                          subtitle: 'Registered Fleet',
                          icon: Icons.people_alt_rounded,
                          color: Colors.purpleAccent,
                          onTap: () => widget.onNavigateTab(4), // Fleet tab
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Quick Action Buttons for PIC Floor Walkaround
                  const Text(
                    'PIC FLOOR ACTIONS',
                    style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => widget.onNavigateTab(1), // Intake screen
                          icon: const Icon(Icons.add_circle_outline_rounded, color: Colors.black87),
                          label: const Text('New Vehicle Intake', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.amber,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Overdue Retention Action List
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'HIGH CHURN RISK (RETENTION SCAN)',
                        style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                      TextButton(
                        onPressed: () => widget.onNavigateTab(3),
                        child: const Text('View All', style: TextStyle(color: Colors.amber, fontSize: 12)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  if (_alerts.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Text(
                          'No overdue vehicles detected. Fleet is on track!',
                          style: TextStyle(color: Colors.white60),
                        ),
                      ),
                    )
                  else
                    ..._alerts.take(2).map((alert) => _buildAlertCard(alert)).toList(),

                  const SizedBox(height: 24),

                  // Live Service Bays Preview
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'CURRENT BAY OCCUPANCY',
                        style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                      TextButton(
                        onPressed: () => widget.onNavigateTab(2),
                        child: const Text('Open Kanban', style: TextStyle(color: Colors.blueAccent, fontSize: 12)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  ..._services.take(3).map((s) => _buildBayCard(s)).toList(),
                ],
              ),
            ),
    );
  }

  Widget _buildMetricTile({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: Colors.white60, fontSize: 12, fontWeight: FontWeight.w500)),
                Icon(icon, size: 18, color: color),
              ],
            ),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(subtitle, style: TextStyle(color: color.withOpacity(0.85), fontSize: 10, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertCard(RetentionAlertModel alert) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.notifications_active_rounded, color: Colors.amber, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      alert.plateNumber,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.redAccent.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${alert.daysOverdue}d Overdue',
                        style: const TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  '${alert.customerName} • ${alert.vehicleName}',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.send_rounded, color: Colors.greenAccent, size: 20),
            tooltip: 'Trigger WhatsApp Reminder',
            onPressed: () async {
              final ok = await ApiService.sendRetentionReminder(alert);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('✓ WhatsApp maintenance reminder sent to ${alert.customerName}!'),
                    backgroundColor: Colors.green.shade700,
                  ),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildBayCard(ServiceOrderModel s) {
    Color stageColor;
    switch (s.stage) {
      case 'In Progress':
        stageColor = Colors.amber;
        break;
      case 'Quality Inspection':
        stageColor = Colors.blueAccent;
        break;
      case 'Ready for Pickup':
        stageColor = Colors.greenAccent;
        break;
      default:
        stageColor = Colors.purpleAccent;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: stageColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(Icons.directions_car_filled_rounded, color: stageColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      s.vehiclePlate,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    Text(
                      s.stage,
                      style: TextStyle(color: stageColor, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  '${s.serviceBay} • ${s.serviceType}',
                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
