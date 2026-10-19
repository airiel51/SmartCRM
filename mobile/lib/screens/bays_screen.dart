import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/models.dart';

class BaysScreen extends StatefulWidget {
  const BaysScreen({Key? key}) : super(key: key);

  @override
  State<BaysScreen> createState() => _BaysScreenState();
}

class _BaysScreenState extends State<BaysScreen> {
  bool _isLoading = true;
  List<ServiceOrderModel> _services = [];
  String _filterBay = 'All';

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
            content: Text('${s.vehiclePlate} advanced to "$nextStage"!'),
            backgroundColor: nextStage == 'Ready for Pickup' ? Colors.green.shade700 : Colors.blue.shade700,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filterBay == 'All'
        ? _services
        : _services.where((s) => s.serviceBay.toLowerCase().contains(_filterBay.toLowerCase())).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Text('Service Bays & Work Orders', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: _loadServices,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : Column(
              children: [
                // Bay Filter Chips
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  color: const Color(0xFF1E293B).withOpacity(0.6),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: ['All', 'Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'].map((bay) {
                        final isSelected = _filterBay == bay;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(bay),
                            selected: isSelected,
                            onSelected: (val) => setState(() => _filterBay = bay),
                            backgroundColor: const Color(0xFF1E293B),
                            selectedColor: Colors.amber,
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.black87 : Colors.white70,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              fontSize: 12,
                            ),
                            checkmarkColor: Colors.black87,
                            side: BorderSide(color: isSelected ? Colors.amber : Colors.white12),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),

                // Work Orders List
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, idx) {
                      final item = filtered[idx];
                      return _buildServiceCard(item);
                    },
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildServiceCard(ServiceOrderModel s) {
    Color stageColor;
    IconData stageIcon;

    switch (s.stage) {
      case 'In Progress':
        stageColor = Colors.amber;
        stageIcon = Icons.engineering_rounded;
        break;
      case 'Quality Inspection':
        stageColor = Colors.blueAccent;
        stageIcon = Icons.fact_check_rounded;
        break;
      case 'Ready for Pickup':
        stageColor = Colors.greenAccent;
        stageIcon = Icons.check_circle_outline_rounded;
        break;
      case 'Invoiced':
        stageColor = Colors.grey;
        stageIcon = Icons.receipt_long_rounded;
        break;
      default:
        stageColor = Colors.purpleAccent;
        stageIcon = Icons.schedule_rounded;
    }

    final curIdx = _stages.indexOf(s.stage);
    final hasNext = curIdx != -1 && curIdx < _stages.length - 1;
    final nextStageTitle = hasNext ? _stages[curIdx + 1] : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: stageColor.withOpacity(0.12),
              borderRadius: const BorderRadius.only(topLeft: Radius.circular(14), topRight: Radius.circular(14)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(stageIcon, color: stageColor, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      s.stage,
                      style: TextStyle(color: stageColor, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Text(
                  s.serviceBay,
                  style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      s.vehiclePlate,
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'RM ${s.totalAmount.toStringAsFixed(2)}',
                      style: const TextStyle(color: Colors.amber, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${s.customerName} • ${s.serviceType}',
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),

                if (s.symptomsReported != null && s.symptomsReported!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.info_outline, color: Colors.white54, size: 14),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            s.symptomsReported!,
                            style: const TextStyle(color: Colors.white60, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 14),

                // Advance Stage Button
                if (hasNext)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _advanceStage(s),
                      icon: const Icon(Icons.arrow_forward_rounded, size: 16, color: Colors.amber),
                      label: Text(
                        'Advance to $nextStageTitle',
                        style: const TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.amber.withOpacity(0.5)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
