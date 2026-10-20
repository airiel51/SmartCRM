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
  final _symptomsCtrl = TextEditingController();

  String _selectedBay = 'Bay 1';
  String _selectedService = 'Standard 10,000 km Service';
  bool _isSubmitting = false;

  // 5-Point Walkaround Quick Toggles (all default to true for speed)
  bool _bodyOk = true;
  bool _tiresOk = true;
  bool _oilOk = true;
  bool _brakesOk = true;
  bool _batteryOk = true;

  final List<String> _servicePresets = [
    'Standard 10,000 km Service',
    'Brake Pad & Disc Overhaul',
    'Aircond Inspection & Gas Refill',
    'Engine Diagnosis & Tune-Up',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialBay != null) {
      _selectedBay = widget.initialBay!;
    }
  }

  void _fillSample(String plate, String name, String phone, String service, String bay) {
    setState(() {
      _plateCtrl.text = plate;
      _customerNameCtrl.text = name;
      _phoneCtrl.text = phone;
      _selectedService = service;
      _selectedBay = bay;
      _symptomsCtrl.text = "Regular scheduled maintenance & general checkup.";
    });
  }

  Future<void> _submitIntake() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final checklist = [
      _bodyOk ? 'Body: OK' : 'Body: Scratched',
      _tiresOk ? 'Tires: OK' : 'Tires: Worn',
      _oilOk ? 'Oil: OK' : 'Oil: Low',
      _brakesOk ? 'Brakes: OK' : 'Brakes: Low',
      _batteryOk ? 'Battery: OK' : 'Battery: Weak',
    ].join('; ');

    final success = await ApiService.createVehicleIntake(
      fullName: _customerNameCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      plateNumber: _plateCtrl.text.trim().toUpperCase(),
      make: 'Vehicle',
      model: _selectedService,
      mileage: 35000,
      symptoms: '${_symptomsCtrl.text.trim()} | Inspection: $checklist',
      bay: _selectedBay,
      estimatedCost: 250.00,
    );

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ ${_plateCtrl.text.toUpperCase()} checked in to $_selectedBay!'),
            backgroundColor: const Color(0xFF10B981),
          ),
        );
        widget.onIntakeCreated();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Check-in failed. Please verify network connection.'),
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
          'Quick Vehicle Check-In',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          children: [
            // Quick Fill Presets row for easy testing
            Row(
              children: [
                const Text('Quick Demo:', style: TextStyle(color: Colors.white54, fontSize: 11)),
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => _fillSample('VAB 2020', 'Priya Subramaniam', '+60 16-554 2190', 'Brake Pad & Disc Overhaul', 'Bay 1'),
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.amber.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                    child: const Text('VAB 2020 (Proton)', style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 6),
                InkWell(
                  onTap: () => _fillSample('PNG 4419', 'Tan Wei Ming', '+60 17-882 1902', 'Standard 10,000 km Service', 'Bay 2'),
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.blue.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                    child: const Text('PNG 4419 (Honda)', style: TextStyle(color: Colors.lightBlueAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Card 1: Car & Owner Info
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
                  const Text('CAR & OWNER', style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8)),
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
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                  ),
                  const SizedBox(height: 10),
                  // Customer Name
                  TextFormField(
                    controller: _customerNameCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Customer Name',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                      prefixIcon: const Icon(Icons.person_outline, color: Colors.white38),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                  ),
                  const SizedBox(height: 10),
                  // Phone Number
                  TextFormField(
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'WhatsApp Phone Number',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                      prefixIcon: const Icon(Icons.phone_android_outlined, color: Colors.greenAccent),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
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
                  const Text('ASSIGN WORKSHOP BAY', style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8)),
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

                  const Text('SERVICE PACKAGE', style: TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),

                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: _servicePresets.map((service) {
                      final isSelected = _selectedService == service;
                      return ChoiceChip(
                        label: Text(service, style: TextStyle(fontSize: 11, color: isSelected ? Colors.black87 : Colors.white70, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
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
                      const Text('5-POINT WALKAROUND', style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8)),
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
                        child: const Text('Reset All OK', style: TextStyle(color: Colors.greenAccent, fontSize: 11)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _buildCheckChip('Body Paint', _bodyOk, () => setState(() => _bodyOk = !_bodyOk)),
                      _buildCheckChip('Tire Tread', _tiresOk, () => setState(() => _tiresOk = !_tiresOk)),
                      _buildCheckChip('Engine Oil', _oilOk, () => setState(() => _oilOk = !_oilOk)),
                      _buildCheckChip('Brake Pads', _brakesOk, () => setState(() => _brakesOk = !_brakesOk)),
                      _buildCheckChip('12V Battery', _batteryOk, () => setState(() => _batteryOk = !_batteryOk)),
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
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                    : const Icon(Icons.check_circle_rounded, color: Colors.black87),
                label: Text(
                  _isSubmitting ? 'Assigning Bay...' : 'Confirm Check-In to $_selectedBay',
                  style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 15),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber,
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
          color: isOk ? Colors.green.withOpacity(0.15) : Colors.red.withOpacity(0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isOk ? Colors.greenAccent.shade400 : Colors.redAccent,
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isOk ? Icons.check_circle_rounded : Icons.cancel_rounded, size: 14, color: isOk ? Colors.greenAccent : Colors.redAccent),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                color: isOk ? Colors.white : Colors.redAccent,
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
