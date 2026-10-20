import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/whatsapp_launcher.dart';
import '../models/models.dart';

class BaysScreen extends StatefulWidget {
  final Function(int, {String? defaultBay})? onNavigateTab;
  const BaysScreen({Key? key, this.onNavigateTab}) : super(key: key);

  @override
  State<BaysScreen> createState() => _BaysScreenState();
}

class _BaysScreenState extends State<BaysScreen> {
  bool _isLoading = true;
  List<ServiceOrderModel> _services = [];

  final List<String> _stages = [
    'Scheduled',
    'In Progress',
    'Quality Inspection',
    'Ready for Pickup',
    'Invoiced'
  ];

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    setState(() => _isLoading = true);
    final list = await ApiService.getServices();
    if (mounted) {
      setState(() {
        _services = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _advanceStage(ServiceOrderModel s) async {
    final curIdx = _stages.indexOf(s.stage);
    if (curIdx < _stages.length - 1) {
      final nextStage = _stages[curIdx + 1];
      setState(() {
        final idx = _services.indexWhere((x) => x.id == s.id);
        if (idx != -1) {
          _services[idx] = ServiceOrderModel(
            id: s.id,
            customerName: s.customerName,
            vehiclePlate: s.vehiclePlate,
            serviceType: s.serviceType,
            stage: nextStage,
            serviceBay: s.serviceBay,
            symptomsReported: s.symptomsReported,
            technicianNotes: s.technicianNotes,
            totalAmount: s.totalAmount,
          );
        }
      });

      await ApiService.updateServiceStage(s.id, nextStage);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${s.vehiclePlate} updated to $nextStage'),
            backgroundColor: nextStage == 'Ready for Pickup' ? const Color(0xFF10B981) : Colors.amber.shade700,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  void _notifyCustomerReady(ServiceOrderModel s) {
    final msg = "Hello ${s.customerName}! Your car (${s.vehiclePlate}) is ready for collection at Apex AutoWorks. Service: ${s.serviceType}. Thank you!";
    WhatsAppLauncher.openChat(
      phone: "+60165542190",
      message: msg,
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Opening WhatsApp for ${s.customerName}...'),
        backgroundColor: const Color(0xFF10B981),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final allBays = ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'];
    final activeOrders = _services.where((s) => s.stage != 'Invoiced').toList();
    final occupiedCount = activeOrders.map((s) => s.serviceBay).toSet().length;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Apex AutoWorks',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            Text(
              '$occupiedCount of 4 bays in use',
              style: const TextStyle(fontSize: 12, color: Colors.amber, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: _loadServices,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : RefreshIndicator(
              onRefresh: _loadServices,
              color: Colors.amber,
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: allBays.map((bayName) {
                  final order = activeOrders.firstWhere(
                    (s) => s.serviceBay.toLowerCase().trim() == bayName.toLowerCase().trim(),
                    orElse: () => ServiceOrderModel(
                      id: '-1',
                      customerName: '',
                      vehiclePlate: '',
                      serviceType: '',
                      stage: 'Vacant',
                      serviceBay: bayName,
                      symptomsReported: '',
                      technicianNotes: '',
                      totalAmount: 0,
                    ),
                  );

                  return _buildBayCard(bayName, order);
                }).toList(),
              ),
            ),
    );
  }

  Widget _buildBayCard(String bayName, ServiceOrderModel s) {
    final isOccupied = s.id != '-1';

    Color badgeBg;
    Color badgeText;
    String statusLabel;

    if (!isOccupied) {
      badgeBg = Colors.green.withOpacity(0.15);
      badgeText = const Color(0xFF34D399);
      statusLabel = 'Available';
    } else {
      switch (s.stage) {
        case 'In Progress':
          badgeBg = Colors.amber.withOpacity(0.2);
          badgeText = Colors.amber;
          statusLabel = 'In Service';
          break;
        case 'Quality Inspection':
          badgeBg = Colors.blue.withOpacity(0.2);
          badgeText = Colors.lightBlueAccent;
          statusLabel = 'Final Check';
          break;
        case 'Ready for Pickup':
          badgeBg = const Color(0xFF10B981).withOpacity(0.2);
          badgeText = const Color(0xFF34D399);
          statusLabel = 'Ready';
          break;
        default:
          badgeBg = Colors.purple.withOpacity(0.2);
          badgeText = Colors.purpleAccent;
          statusLabel = 'Waiting';
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isOccupied ? Colors.white.withOpacity(0.12) : Colors.white.withOpacity(0.05),
          width: 1.2,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top row: Bay Name & Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isOccupied ? Colors.amber.withOpacity(0.2) : Colors.white10,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.car_repair_rounded,
                        color: isOccupied ? Colors.amber : Colors.white38,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      bayName,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    statusLabel,
                    style: TextStyle(
                      color: badgeText,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            if (!isOccupied)
              InkWell(
                onTap: () {
                  if (widget.onNavigateTab != null) {
                    widget.onNavigateTab!(1, defaultBay: bayName);
                  }
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.add_circle_outline_rounded, color: Colors.amber, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        'Assign Car to $bayName',
                        style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              )
            else ...[
              // Occupied Bay Information
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white24),
                    ),
                    child: Text(
                      s.vehiclePlate,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s.customerName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          s.serviceType,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // Action Buttons
              if (s.stage == 'Ready for Pickup')
                Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: ElevatedButton.icon(
                        onPressed: () => _notifyCustomerReady(s),
                        icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 16),
                        label: const Text('WhatsApp Customer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 2,
                      child: OutlinedButton(
                        onPressed: () => _advanceStage(s),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.white24),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Clear Bay', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      ),
                    ),
                  ],
                )
              else
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _advanceStage(s),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: s.stage == 'In Progress' ? Colors.blueAccent : Colors.amber,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text(
                      s.stage == 'Scheduled'
                          ? 'Start Work in $bayName ➔'
                          : s.stage == 'In Progress'
                              ? 'Move to Final Check ➔'
                              : 'Mark Ready for Pickup ➔',
                      style: TextStyle(
                        color: s.stage == 'In Progress' ? Colors.white : Colors.black87,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }
}
