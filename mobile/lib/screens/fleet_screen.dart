import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/whatsapp_launcher.dart';
import '../models/models.dart';
import 'dashboard_screen.dart' show BouncingTouchCard, PulsingDot;

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
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        title: const Text(
          'Customers & Vehicles',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF64748B)),
            onPressed: _loadCustomers,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F172A)))
          : Column(
              children: [
                // Search Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: TextField(
                    onChanged: (v) => setState(() => _query = v),
                    style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Search by plate, customer, or phone...',
                      hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                      prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 20),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF0F172A)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),

                // Customer list
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: _loadCustomers,
                    color: const Color(0xFF0F172A),
                    child: filtered.isEmpty
                        ? const Center(
                            child: Text('No customers found.', style: TextStyle(color: Color(0xFF64748B))),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 96),
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
    return BouncingTouchCard(
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
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
                      style: const TextStyle(color: Color(0xFF0F172A), fontSize: 15, fontWeight: FontWeight.bold),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    c.phone,
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w500),
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
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Text(
                        '${v.plateNumber} (${v.make} ${v.model})',
                        style: const TextStyle(color: Color(0xFF0F172A), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    );
                  }).toList(),
                ),

              const SizedBox(height: 12),

              // Action Buttons: Call & WhatsApp
              Row(
                children: [
                  Expanded(
                    child: BouncingTouchCard(
                      onTap: () => WhatsAppLauncher.callCustomer(c.phone),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFCBD5E1)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.call_rounded, size: 14, color: Color(0xFF0F172A)),
                            SizedBox(width: 4),
                            Text('Call', style: TextStyle(color: Color(0xFF0F172A), fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: BouncingTouchCard(
                      onTap: () {
                        final plate = c.vehicles.isNotEmpty ? c.vehicles.first.plateNumber : 'your car';
                        WhatsAppLauncher.openChat(
                          phone: c.phone,
                          message: "Hello ${c.fullName}! Contacting you from Apex AutoWorks regarding your $plate.",
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 6, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.chat_bubble_outline_rounded, size: 14, color: Color(0xFF22C55E)),
                            SizedBox(width: 4),
                            Text('WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
