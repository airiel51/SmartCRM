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
            backgroundColor: nextStage == 'Ready for Pickup' ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  void _notifyCustomerReady(ServiceOrderModel s) {
    final msg = "Hello ${s.customerName}! Your vehicle (${s.vehiclePlate}) is inspected and ready for pickup at Apex AutoWorks. Thank you!";
    WhatsAppLauncher.openChat(
      phone: "+60165542190",
      message: msg,
    );
  }

  @override
  Widget build(BuildContext context) {
    final allBays = ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'];
    final activeOrders = _services.where((s) => s.stage != 'Invoiced' && s.stage != 'Completed').toList();
    final occupiedCount = allBays.where((b) => activeOrders.any((s) => s.serviceBay.toLowerCase().contains(b.toLowerCase()))).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Apex AutoWorks',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            Text(
              '$occupiedCount of 4 bays in use',
              style: const TextStyle(fontSize: 12, color: Color(0xFFD97706), fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF64748B)),
            onPressed: _loadServices,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
          : RefreshIndicator(
              onRefresh: _loadServices,
              color: const Color(0xFFF59E0B),
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: allBays.map((bayName) {
                  final order = activeOrders.firstWhere(
                    (s) => s.serviceBay.toLowerCase().contains(bayName.toLowerCase()),
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
      badgeBg = const Color(0xFFECFDF5);
      badgeText = const Color(0xFF059669);
      statusLabel = 'Available';
    } else {
      switch (s.stage) {
        case 'In Progress':
          badgeBg = const Color(0xFFFEF3C7);
          badgeText = const Color(0xFFD97706);
          statusLabel = 'In Service';
          break;
        case 'Quality Inspection':
          badgeBg = const Color(0xFFEFF6FF);
          badgeText = const Color(0xFF2563EB);
          statusLabel = 'Final Check';
          break;
        case 'Ready for Pickup':
          badgeBg = const Color(0xFFECFDF5);
          badgeText = const Color(0xFF059669);
          statusLabel = 'Ready';
          break;
        default:
          badgeBg = const Color(0xFFF3E8FF);
          badgeText = const Color(0xFF7C3AED);
          statusLabel = 'Waiting';
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isOccupied ? const Color(0xFFCBD5E1) : const Color(0xFFE2E8F0),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
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
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: isOccupied ? const Color(0xFFFEF3C7) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.car_repair_rounded,
                        color: isOccupied ? const Color(0xFFD97706) : const Color(0xFF94A3B8),
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      bayName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    statusLabel,
                    style: TextStyle(
                      color: badgeText,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.3,
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
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.add_circle_outline_rounded, color: Color(0xFFD97706), size: 18),
                      const SizedBox(width: 8),
                      Text(
                        'Assign Car to $bayName',
                        style: const TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.bold, fontSize: 13),
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
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      s.vehiclePlate,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1,
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
                            color: Color(0xFF0F172A),
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          s.serviceType,
                          style: const TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
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
                          side: const BorderSide(color: Color(0xFFCBD5E1)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Clear Bay', style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
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
                      backgroundColor: s.stage == 'In Progress' ? const Color(0xFF2563EB) : const Color(0xFFF59E0B),
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
                        color: s.stage == 'In Progress' ? Colors.white : const Color(0xFF0F172A),
                        fontWeight: FontWeight.w900,
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
