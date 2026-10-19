import 'package:flutter/material.dart';
import '../services/api_service.dart';

class IntakeScreen extends StatefulWidget {
  final VoidCallback onIntakeCreated;
  const IntakeScreen({Key? key, required this.onIntakeCreated}) : super(key: key);

  @override
  State<IntakeScreen> createState() => _IntakeScreenState();
}

class _IntakeScreenState extends State<IntakeScreen> {
  final _formKey = GlobalKey<FormState>();

  final _customerNameCtrl = TextEditingController(text: 'Kamarul Ariffin');
  final _phoneCtrl = TextEditingController(text: '+60 12-887 6543');
  final _plateCtrl = TextEditingController(text: 'PGE 8892');
  final _modelCtrl = TextEditingController(text: 'S70 1.5 Turbo');
  final _mileageCtrl = TextEditingController(text: '28400');
  final _symptomsCtrl = TextEditingController(text: 'Steering pulling slightly to the left at highway speeds, periodic 30k service check.');
  final _costCtrl = TextEditingController(text: '280.00');

  String _selectedMake = 'Proton';
  String _selectedBay = 'Bay 1 (Engine)';
  bool _isSubmitting = false;

  // 5-point Walkaround Inspection checklist
  bool _exteriorInspected = true;
  bool _treadDepthOk = true;
  bool _oilLevelOk = false; // requires top-up
  bool _brakePadsOk = true;
  bool _batteryTested = true;

  @override
  void dispose() {
    _customerNameCtrl.dispose();
    _phoneCtrl.dispose();
    _plateCtrl.dispose();
    _modelCtrl.dispose();
    _mileageCtrl.dispose();
    _symptomsCtrl.dispose();
    _costCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitIntake() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final success = await ApiService.createVehicleIntake(
      fullName: _customerNameCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      plateNumber: _plateCtrl.text.trim().toUpperCase(),
      make: _selectedMake,
      model: _modelCtrl.text.trim(),
      mileage: int.tryParse(_mileageCtrl.text.trim()) ?? 0,
      symptoms: _symptomsCtrl.text.trim(),
      bay: _selectedBay,
      estimatedCost: double.tryParse(_costCtrl.text.trim()) ?? 250.0,
    );

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ Vehicle ${_plateCtrl.text.toUpperCase()} checked in & assigned to $_selectedBay!'),
            backgroundColor: Colors.green.shade700,
          ),
        );
        widget.onIntakeCreated();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to complete intake'), backgroundColor: Colors.redAccent),
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
        title: const Text('Shop Floor Vehicle Intake', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner_rounded, color: Colors.amber),
            tooltip: 'Simulate Plate OCR Scan',
            onPressed: () {
              setState(() {
                _plateCtrl.text = 'VAB 2020';
                _selectedMake = 'Proton';
                _modelCtrl.text = 'X50 1.5 TGDi';
                _mileageCtrl.text = '41800';
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Scanned Plate: VAB 2020 (Proton X50)'), duration: Duration(seconds: 2)),
              );
            },
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Guided Walkaround Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.withOpacity(0.3)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.assignment_turned_in_rounded, color: Colors.amber, size: 24),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'PIC Mobile Guide: Complete physical inspection with vehicle owner before confirming job order.',
                      style: TextStyle(color: Colors.white, fontSize: 12, height: 1.3),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Section 1: Customer Profile
            _buildSectionHeader('1. CUSTOMER INFORMATION'),
            const SizedBox(height: 10),
            _buildTextField(controller: _customerNameCtrl, label: 'Customer Full Name', icon: Icons.person_outline),
            const SizedBox(height: 10),
            _buildTextField(controller: _phoneCtrl, label: 'WhatsApp Phone Number', icon: Icons.phone_android_outlined, keyboardType: TextInputType.phone),

            const SizedBox(height: 20),

            // Section 2: Vehicle Specs & Odometer
            _buildSectionHeader('2. VEHICLE SPECIFICATIONS'),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: _buildTextField(controller: _plateCtrl, label: 'Plate Number', icon: Icons.badge_outlined, isPlate: true),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedMake,
                        dropdownColor: const Color(0xFF1E293B),
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        items: ['Proton', 'Perodua', 'Toyota', 'Honda', 'BMW', 'Nissan']
                            .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedMake = val);
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: _buildTextField(controller: _modelCtrl, label: 'Vehicle Model & Engine', icon: Icons.directions_car_outlined),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: _buildTextField(controller: _mileageCtrl, label: 'Mileage (km)', icon: Icons.speed_outlined, keyboardType: TextInputType.number),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Section 3: 5-Point Floor Walkaround Inspection
            _buildSectionHeader('3. 5-POINT WALKAROUND CHECKLIST'),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                children: [
                  CheckboxListTile(
                    title: const Text('Body Panels & Paint Checked (No pre-existing scratch dispute)', style: TextStyle(color: Colors.white, fontSize: 12)),
                    value: _exteriorInspected,
                    activeColor: Colors.amber,
                    checkColor: Colors.black,
                    onChanged: (v) => setState(() => _exteriorInspected = v ?? false),
                  ),
                  const Divider(color: Colors.white10, height: 1),
                  CheckboxListTile(
                    title: const Text('Tire Tread Depth & Pressure > 2.5mm', style: TextStyle(color: Colors.white, fontSize: 12)),
                    value: _treadDepthOk,
                    activeColor: Colors.amber,
                    checkColor: Colors.black,
                    onChanged: (v) => setState(() => _treadDepthOk = v ?? false),
                  ),
                  const Divider(color: Colors.white10, height: 1),
                  CheckboxListTile(
                    title: const Text('Engine Oil Dipstick & Fluid Levels', style: TextStyle(color: Colors.white, fontSize: 12)),
                    value: _oilLevelOk,
                    activeColor: Colors.amber,
                    checkColor: Colors.black,
                    onChanged: (v) => setState(() => _oilLevelOk = v ?? false),
                  ),
                  const Divider(color: Colors.white10, height: 1),
                  CheckboxListTile(
                    title: const Text('Brake Pad Thickness > 3.0mm', style: TextStyle(color: Colors.white, fontSize: 12)),
                    value: _brakePadsOk,
                    activeColor: Colors.amber,
                    checkColor: Colors.black,
                    onChanged: (v) => setState(() => _brakePadsOk = v ?? false),
                  ),
                  const Divider(color: Colors.white10, height: 1),
                  CheckboxListTile(
                    title: const Text('12V Battery Voltage Test Pass (12.6V+)', style: TextStyle(color: Colors.white, fontSize: 12)),
                    value: _batteryTested,
                    activeColor: Colors.amber,
                    checkColor: Colors.black,
                    onChanged: (v) => setState(() => _batteryTested = v ?? false),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Section 4: Customer Symptoms & Bay Assignment
            _buildSectionHeader('4. WORK ORDER & BAY ASSIGNMENT'),
            const SizedBox(height: 10),
            _buildTextField(controller: _symptomsCtrl, label: 'Reported Symptoms / Job Scope', icon: Icons.report_problem_outlined, maxLines: 2),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedBay,
                        dropdownColor: const Color(0xFF1E293B),
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        items: ['Bay 1 (Engine)', 'Bay 2 (Brakes)', 'Bay 3 (AC & Electrical)', 'Bay 4 (General & QC)']
                            .map((b) => DropdownMenuItem(value: b, child: Text(b)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedBay = val);
                        },
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: _buildTextField(controller: _costCtrl, label: 'Est. Total (RM)', icon: Icons.payments_outlined, keyboardType: TextInputType.number),
                ),
              ],
            ),

            const SizedBox(height: 28),

            // Submit Button
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitIntake,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.amber,
                disabledBackgroundColor: Colors.amber.withOpacity(0.5),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isSubmitting
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black87))
                  : const Text('Confirm Intake & Open Work Order', style: TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.bold)),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    bool isPlate = false,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      textCapitalization: isPlate ? TextCapitalization.characters : TextCapitalization.sentences,
      style: const TextStyle(color: Colors.white, fontSize: 13),
      validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
        prefixIcon: Icon(icon, color: isPlate ? Colors.amber : Colors.white54, size: 18),
        filled: true,
        fillColor: const Color(0xFF1E293B),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white12)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white12)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.amber)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }
}
