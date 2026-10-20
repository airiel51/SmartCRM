import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/whatsapp_launcher.dart';
import '../models/models.dart';

class FleetScreen extends StatefulWidget {
  const FleetScreen({Key? key}) : super(key: key);

  @override
  State<FleetScreen> createState() => _FleetScreenState();
}

class _FleetScreenState extends State<FleetScreen> {
  bool _isLoading = true;
  List<CustomerModel> _customers = [];
  String _query = '';

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
      final q = _query.toLowerCase().trim();
      if (q.isEmpty) return true;
      final matchName = c.fullName.toLowerCase().contains(q);
      final matchPhone = c.phone.toLowerCase().contains(q);
      final matchPlate = c.vehicles.any((v) => v.plateNumber.toLowerCase().contains(q));
      return matchName || matchPhone || matchPlate;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Text(
          'Customer Directory',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
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
                // Search Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: TextField(
                    onChanged: (v) => setState(() => _query = v),
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Search plate, customer, or phone...',
                      hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                      prefixIcon: const Icon(Icons.search_rounded, color: Colors.amber, size: 20),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),

                // Customer list
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: _loadCustomers,
                    color: Colors.amber,
                    child: filtered.isEmpty
                        ? const Center(
                            child: Text('No customers found.', style: TextStyle(color: Colors.white54)),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            itemCount: filtered.length,
                            itemBuilder: (context, idx) {
                              final c = filtered[idx];
                              return _buildCustomerCard(c);
                            },
                          ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildCustomerCard(CustomerModel c) {
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
            // Top row: Name & Phone
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    c.fullName,
                    style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  c.phone,
                  style: const TextStyle(color: Colors.white60, fontSize: 12),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Vehicles Tags
            if (c.vehicles.isNotEmpty)
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: c.vehicles.map((v) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Text(
                      '${v.plateNumber} (${v.make} ${v.model})',
                      style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  );
                }).toList(),
              ),

            const SizedBox(height: 12),

            // Action Buttons: Call & WhatsApp
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => WhatsAppLauncher.makePhoneCall(c.phone),
                    icon: const Icon(Icons.call_rounded, size: 14, color: Colors.white70),
                    label: const Text('Call', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white24),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      final plate = c.vehicles.isNotEmpty ? c.vehicles.first.plateNumber : 'your car';
                      WhatsAppLauncher.openChat(
                        phone: c.phone,
                        message: "Hi ${c.fullName}, contacting you from Apex AutoWorks regarding your $plate.",
                      );
                    },
                    icon: const Icon(Icons.chat_bubble_outline_rounded, size: 14, color: Colors.white),
                    label: const Text('WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
