import 'package:flutter/material.dart';
import '../services/api_service.dart';

class IntakeScreen extends StatefulWidget {
  final VoidCallback onIntakeCreated;
  final String? initialBay;
  const IntakeScreen({Key? key, required this.onIntakeCreated, this.initialBay}) : super(key: key);

  @override
  State<IntakeScreen> createState() => _IntakeScreenState();
}

class _IntakeScreenState extends State<IntakeScreen> {
  final _formKey = GlobalKey<FormState>();

  final _plateCtrl = TextEditingController();
  final _customerNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();

  String _selectedBay = 'Bay 1';
  String _selectedService = 'Regular Oil Service';
  bool _isSubmitting = false;

  // 5-Point Walkaround Quick Toggles
  bool _bodyOk = true;
  bool _tiresOk = true;
  bool _oilOk = true;
  bool _brakesOk = true;
  bool _batteryOk = true;

  final List<String> _servicePresets = [
    'Regular Oil Service',
    'Brake Service',
    'Aircond Service',
    'Major Inspection',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialBay != null) {
      _selectedBay = widget.initialBay!;
    }
  }

  Future<void> _submitIntake() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final checklist = [
      _bodyOk ? 'Paint: OK' : 'Paint: Scratched',
      _tiresOk ? 'Tires: OK' : 'Tires: Worn',
      _oilOk ? 'Oil: OK' : 'Oil: Low',
      _brakesOk ? 'Brakes: OK' : 'Brakes: Low',
      _batteryOk ? 'Battery: OK' : 'Battery: Weak',
    ].join(', ');

    final success = await ApiService.createVehicleIntake(
      fullName: _customerNameCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      plateNumber: _plateCtrl.text.trim().toUpperCase(),
      make: 'Vehicle',
      model: _selectedService,
      mileage: 35000,
      symptoms: _notesCtrl.text.trim().isNotEmpty
          ? '${_notesCtrl.text.trim()} ($checklist)'
          : checklist,
      bay: _selectedBay,
      estimatedCost: 250.00,
    );

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ ${_plateCtrl.text.toUpperCase()} checked in to $_selectedBay'),
            backgroundColor: const Color(0xFF10B981),
          ),
        );
        widget.onIntakeCreated();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Unable to complete check-in. Please try again.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Text(
          'Vehicle Check-In',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          children: [
            // Card 1: Car & Customer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'CAR & CUSTOMER',
                    style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                  ),
                  const SizedBox(height: 12),
                  // Plate number input
                  TextFormField(
                    controller: _plateCtrl,
                    textCapitalization: TextCapitalization.characters,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                    decoration: InputDecoration(
                      labelText: 'Car Plate Number',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                      hintText: 'e.g. VAB 2020',
                      hintStyle: const TextStyle(color: Colors.white24, fontSize: 14),
                      prefixIcon: const Icon(Icons.badge_outlined, color: Colors.amber),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter plate number' : null,
                  ),
                  const SizedBox(height: 10),
                  // Customer Name
                  TextFormField(
                    controller: _customerNameCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Customer Name',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                      hintText: 'e.g. Ahmad Razali',
                      hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
                      prefixIcon: const Icon(Icons.person_outline, color: Colors.white38),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter customer name' : null,
                  ),
                  const SizedBox(height: 10),
                  // Phone Number
                  TextFormField(
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Contact Phone Number',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                      hintText: 'e.g. 012-345 6789',
                      hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
                      prefixIcon: const Icon(Icons.phone_outlined, color: Colors.greenAccent),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter phone number' : null,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Card 2: Bay & Service Selection
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SELECT BAY',
                    style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                  ),
                  const SizedBox(height: 10),
                  // 4 Big Bay Selection Buttons
                  Row(
                    children: ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'].map((bay) {
                      final isSelected = _selectedBay == bay;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 3),
                          child: InkWell(
                            onTap: () => setState(() => _selectedBay = bay),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.amber : const Color(0xFF0F172A),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSelected ? Colors.amber : Colors.white12,
                                  width: 1.5,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  bay,
                                  style: TextStyle(
                                    color: isSelected ? Colors.black87 : Colors.white70,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 14),

                  const Text(
                    'SERVICE TYPE',
                    style: TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),

                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: _servicePresets.map((service) {
                      final isSelected = _selectedService == service;
                      return ChoiceChip(
                        label: Text(
                          service,
                          style: TextStyle(
                            fontSize: 11,
                            color: isSelected ? Colors.black87 : Colors.white70,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: Colors.amber,
                        backgroundColor: const Color(0xFF0F172A),
                        onSelected: (val) {
                          if (val) setState(() => _selectedService = service);
                        },
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Card 3: 5-Point Quick Check
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'VEHICLE INSPECTION CHECK',
                        style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                      ),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _bodyOk = true;
                            _tiresOk = true;
                            _oilOk = true;
                            _brakesOk = true;
                            _batteryOk = true;
                          });
                        },
                        style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(50, 20)),
                        child: const Text('All OK', style: TextStyle(color: Color(0xFF166534), fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _buildCheckChip('Paint OK', _bodyOk, () => setState(() => _bodyOk = !_bodyOk)),
                      _buildCheckChip('Tires OK', _tiresOk, () => setState(() => _tiresOk = !_tiresOk)),
                      _buildCheckChip('Oil Level OK', _oilOk, () => setState(() => _oilOk = !_oilOk)),
                      _buildCheckChip('Brakes OK', _brakesOk, () => setState(() => _brakesOk = !_brakesOk)),
                      _buildCheckChip('Battery OK', _batteryOk, () => setState(() => _batteryOk = !_batteryOk)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _isSubmitting ? null : _submitIntake,
                icon: _isSubmitting
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.check_circle_rounded, color: Colors.white),
                label: Text(
                  _isSubmitting ? 'Checking In...' : 'Check In to $_selectedBay',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckChip(String label, bool isOk, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: isOk ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isOk ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isOk ? Icons.check_circle_rounded : Icons.cancel_rounded, size: 14, color: isOk ? const Color(0xFF166534) : const Color(0xFF991B1B)),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                color: isOk ? const Color(0xFF166534) : const Color(0xFF991B1B),
                fontSize: 12,
                fontWeight: isOk ? FontWeight.w500 : FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
