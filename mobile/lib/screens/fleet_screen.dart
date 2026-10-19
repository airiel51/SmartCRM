import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/models.dart';

class FleetScreen extends StatefulWidget {
  const FleetScreen({Key? key}) : super(key: key);

  @override
  State<FleetScreen> createState() => _FleetScreenState();
}

class _FleetScreenState extends State<FleetScreen> {
  bool _isLoading = true;
  List<CustomerModel> _customers = [];
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadCustomers();
  }

  Future<void> _loadCustomers() async {
    setState(() => _isLoading = true);
    final list = await ApiService.getCustomers();
    if (mounted) {
      setState(() {
        _customers = list;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _customers.where((c) {
      final q = _search.toLowerCase();
      final matchName = c.fullName.toLowerCase().contains(q);
      final matchPhone = c.phone.contains(q);
      final matchPlate = c.vehicles.any((v) => v.plateNumber.toLowerCase().contains(q));
      return matchName || matchPhone || matchPlate;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Text('Customer & Vehicle Fleet', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: _loadCustomers,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : Column(
              children: [
                // Search bar
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: TextField(
                    onChanged: (val) => setState(() => _search = val),
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Search customer, phone, or plate...',
                      hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                      prefixIcon: const Icon(Icons.search_rounded, color: Colors.amber, size: 20),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white12)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white12)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.amber)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),

                // Customer Count Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'REGISTERED CLIENTS (${filtered.length})',
                        style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                      ),
                      const Text(
                        'Multi-Vehicle Linking Active',
                        style: TextStyle(color: Colors.tealAccent, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // Customer Cards List
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, idx) {
                      final c = filtered[idx];
                      return _buildCustomerCard(c);
                    },
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildCustomerCard(CustomerModel c) {
    Color riskColor;
    if (c.churnRisk == 'High') {
      riskColor = Colors.redAccent;
    } else if (c.churnRisk == 'Medium') {
      riskColor = Colors.amber;
    } else {
      riskColor = Colors.greenAccent;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
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
            // Top Row: Name + Churn Risk Pill
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: Colors.amber.shade700,
                      child: Text(
                        c.fullName.isNotEmpty ? c.fullName[0].toUpperCase() : 'C',
                        style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          c.fullName,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        Text(
                          c.phone,
                          style: const TextStyle(color: Colors.white54, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: riskColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: riskColor.withOpacity(0.4)),
                  ),
                  child: Text(
                    '${c.churnRisk} Churn Risk',
                    style: TextStyle(color: riskColor, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Metrics row: Health Score, Spend, Visits
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatPill('Health', '${c.healthScore}/100', Colors.tealAccent),
                _buildStatPill('Total Spent', 'RM ${c.totalSpent.toStringAsFixed(0)}', Colors.amber),
                _buildStatPill('Visits', '${c.visitCount}', Colors.blueAccent),
              ],
            ),

            const SizedBox(height: 12),

            // Linked Vehicles Section
            const Text(
              'Linked Vehicles:',
              style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),

            if (c.vehicles.isEmpty)
              const Text('No vehicles registered yet.', style: TextStyle(color: Colors.white38, fontSize: 11))
            else
              ...c.vehicles.map((v) => _buildVehicleBadge(v)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatPill(String label, String value, Color col) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(color: col, fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildVehicleBadge(VehicleModel v) {
    Color statusColor;
    if (v.maintenanceStatus == 'Overdue') {
      statusColor = Colors.redAccent;
    } else if (v.maintenanceStatus == 'Due Soon') {
      statusColor = Colors.amber;
    } else {
      statusColor = Colors.greenAccent;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white10,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  v.plateNumber,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '${v.make} ${v.model}',
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                '${v.currentMileage} km',
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
              const SizedBox(width: 8),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
