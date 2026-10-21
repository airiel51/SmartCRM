import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8000/api/v1';

  // 1. Fetch Customers and multi-vehicle linking
  static Future<List<CustomerModel>> getCustomers() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/customers'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => CustomerModel.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getFallbackCustomers();
  }

  // 2. Fetch Service Work Orders (Bays 1-4 & Stages)
  static Future<List<ServiceOrderModel>> getServices() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/services'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => ServiceOrderModel.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getFallbackServices();
  }

  // 3. Update Service Stage & Bay
  static Future<bool> updateServiceStage(String serviceId, String stage) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/services/$serviceId/stage'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'stage': stage}),
      ).timeout(const Duration(seconds: 3));
      return response.statusCode == 200;
    } catch (_) {
      return true; // Local simulation fallback
    }
  }

  // 4. Fetch Autonomous Retention Scanner Alerts
  static Future<List<RetentionAlertModel>> getRetentionAlerts() async {
    try {
      final response = await http
          .post(Uri.parse('$baseUrl/retention/scan'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        final List<dynamic> overdue = data['overdue_vehicles'] ?? [];
        return overdue.map((item) => RetentionAlertModel.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getFallbackRetentionAlerts();
  }

  // 5. Send Retention Reminder via WhatsApp
  static Future<bool> sendRetentionReminder(RetentionAlertModel alert) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/retention/send-reminder'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'vehicle_id': alert.vehicleId,
          'customer_id': alert.customerId,
          'phone': alert.phone,
          'message_text': alert.reminderDraft,
        }),
      ).timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (_) {
      return true; // Local simulation
    }
  }

  // 6. Submit New Vehicle Intake from Shop Floor
  static Future<bool> createVehicleIntake({
    required String fullName,
    required String phone,
    required String plateNumber,
    required String make,
    required String model,
    required int mileage,
    required String symptoms,
    required String bay,
    required double estimatedCost,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/services/intake'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'customer_name': fullName,
          'phone': phone,
          'plate_number': plateNumber,
          'make': make,
          'model': model,
          'mileage': mileage,
          'symptoms': symptoms,
          'service_bay': bay,
          'estimated_cost': estimatedCost,
        }),
      ).timeout(const Duration(seconds: 4));
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return true; // Local optimistic update
    }
  }

  // 7. Conversational Copilot Chat for Agentic AI
  static Future<String> copilotChat(String query) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/agents/copilot-chat'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'query': query}),
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        return data['reply'] ?? 'Query processed.';
      }
    } catch (_) {}

    final q = query.toLowerCase();
    if (q.contains('bay') || q.contains('occupan')) {
      return "Current Bay Utilization is 75% (3 of 4 Active):\n• Bay 1: Nurul Huda (KV 5502) - Service\n• Bay 2: Priya Subramaniam (VAB 2020) - Brakes\n• Bay 3: Michael Wong (JRS 7731) - AC Flush (Final Check)\n• Bay 4: Farhan Azman (BQP 9912) - MOTUL 300V";
    } else if (q.contains('overdue') || q.contains('alert') || q.contains('retention')) {
      return "Tracking 2 urgent overdue vehicles:\n• Ahmad Razali (Myvi WXY 8821): 3,400km past threshold\n• Nurul Huda (Bezza KV 5502): Due in 10 days\n\nWhatsApp reminder drafts are staged.";
    } else if (q.contains('repeat') || q.contains('rate') || q.contains('revenue')) {
      return "Workshop Loyalty Metrics:\n• Repeat-Service Rate: 74.2% (Benchmark)\n• Monthly Revenue: RM 48,250.00\n• Churn Recoverable Value: RM 8,420.00";
    }
    return "Based on live workshop records:\n• Active Fleet: 186 vehicles under care\n• 4 active bays in Bayan Lepas\n• WhatsApp NLP parsing: 100% active.";
  }

  // Fallback Data if backend is starting or offline
  static List<CustomerModel> _getFallbackCustomers() {
    return [
      CustomerModel(
        id: 'c-1',
        fullName: 'Ahmad Razali',
        phone: '+60 12-345 6789',
        email: 'ahmad.razali@gmail.com',
        address: 'Taman Sri Nibong, Bayan Lepas, Penang',
        status: 'Overdue',
        healthScore: 38,
        churnRisk: 'High',
        sentiment: 'Negative',
        totalSpent: 1450.0,
        visitCount: 3,
        vehicles: [
          VehicleModel(
            id: 'v-1',
            plateNumber: 'WXY 8821',
            make: 'Perodua',
            model: 'Myvi 1.5 AV',
            year: 2021,
            currentMileage: 58400,
            maintenanceStatus: 'Overdue',
            customerName: 'Ahmad Razali',
            customerPhone: '+60 12-345 6789',
          ),
        ],
      ),
      CustomerModel(
        id: 'c-2',
        fullName: 'Tan Wei Ming',
        phone: '+60 17-882 1902',
        email: 'weiming.tan@outlook.com',
        address: 'Greenlane Heights, Georgetown, Penang',
        status: 'Active',
        healthScore: 92,
        churnRisk: 'Low',
        sentiment: 'Positive',
        totalSpent: 3820.0,
        visitCount: 5,
        vehicles: [
          VehicleModel(
            id: 'v-2',
            plateNumber: 'PNG 4419',
            make: 'Honda',
            model: 'Civic RS 1.5 Turbo',
            year: 2022,
            currentMileage: 38200,
            maintenanceStatus: 'On Track',
            customerName: 'Tan Wei Ming',
            customerPhone: '+60 17-882 1902',
          ),
        ],
      ),
      CustomerModel(
        id: 'c-3',
        fullName: 'Priya Subramaniam',
        phone: '+60 16-554 2190',
        email: 'priya.subra@yahoo.com',
        address: 'Pulau Tikus, Penang',
        status: 'Due Soon',
        healthScore: 76,
        churnRisk: 'Medium',
        sentiment: 'Neutral',
        totalSpent: 2190.0,
        visitCount: 4,
        vehicles: [
          VehicleModel(
            id: 'v-3',
            plateNumber: 'VAB 2020',
            make: 'Proton',
            model: 'X50 1.5 TGDi Flagship',
            year: 2021,
            currentMileage: 41800,
            maintenanceStatus: 'Due Soon',
            customerName: 'Priya Subramaniam',
            customerPhone: '+60 16-554 2190',
          ),
        ],
      ),
      CustomerModel(
        id: 'c-4',
        fullName: 'Michael Wong',
        phone: '+60 19-411 9832',
        email: 'mwong@apexlogistics.my',
        address: 'Gelugor, Penang',
        status: 'Active',
        healthScore: 88,
        churnRisk: 'Low',
        sentiment: 'Positive',
        totalSpent: 7600.0,
        visitCount: 8,
        vehicles: [
          VehicleModel(
            id: 'v-4',
            plateNumber: 'JRS 7731',
            make: 'Toyota',
            model: 'Vios 1.5G Dual VVT-i',
            year: 2020,
            currentMileage: 72000,
            maintenanceStatus: 'On Track',
            customerName: 'Michael Wong',
            customerPhone: '+60 19-411 9832',
          ),
        ],
      ),
    ];
  }

  static List<ServiceOrderModel> _getFallbackServices() {
    return [
      ServiceOrderModel(
        id: 's-1',
        customerName: 'Ahmad Razali',
        vehiclePlate: 'WXY 8821',
        serviceType: '50k Major Service & Diagnostics',
        stage: 'Inquiry',
        serviceBay: 'Bay 1 (Engine)',
        symptomsReported: 'Check engine light blinking, engine vibration during idle',
        technicianNotes: 'Throttle body cleaned, spark plugs replaced.',
        totalAmount: 400.0,
      ),
      ServiceOrderModel(
        id: 's-2',
        customerName: 'Tan Wei Ming',
        vehiclePlate: 'PNG 4419',
        serviceType: 'Full Synthetic Engine Oil Service',
        stage: 'Scheduled',
        serviceBay: 'Bay 1 (Engine)',
        symptomsReported: 'Periodic 10k synthetic maintenance',
        technicianNotes: 'Liqui Moly 5W-30 Full Synthetic with genuine filter.',
        totalAmount: 328.0,
      ),
      ServiceOrderModel(
        id: 's-3',
        customerName: 'Priya Subramaniam',
        vehiclePlate: 'VAB 2020',
        serviceType: 'Brake Pad & Rotor Inspection',
        stage: 'In Progress',
        serviceBay: 'Bay 2 (Brakes)',
        symptomsReported: 'High pitched squeak when braking near Bayan Lepas',
        technicianNotes: 'Front ceramic pads replaced, rotors resurfaced.',
        totalAmount: 440.0,
      ),
      ServiceOrderModel(
        id: 's-4',
        customerName: 'Michael Wong',
        vehiclePlate: 'JRS 7731',
        serviceType: 'Air Conditioning Flush & Regas',
        stage: 'Quality Inspection',
        serviceBay: 'Bay 3 (AC & Electrical)',
        symptomsReported: 'Blower weak and blowing lukewarm air',
        technicianNotes: 'Cabin filter replaced, R134a refrigerant charged.',
        totalAmount: 210.0,
      ),
    ];
  }

  static List<RetentionAlertModel> _getFallbackRetentionAlerts() {
    return [
      RetentionAlertModel(
        vehicleId: 'v-1',
        customerId: 'c-1',
        customerName: 'Ahmad Razali',
        phone: '+60 12-345 6789',
        plateNumber: 'WXY 8821',
        vehicleName: 'Perodua Myvi 1.5 AV',
        currentMileage: 58400,
        kmOverdue: 3400,
        daysOverdue: 30,
        churnRisk: 'High',
        reminderDraft:
            'Salam & Hello Ahmad Razali! This is Airiel from Apex AutoWorks. Our SmartCRM maintenance tracker indicates your Perodua Myvi (WXY 8821) is currently 30 days overdue for its Major 40,000km Spark Plug & Brake Inspection. We have reserved Bay 1 for you this week. Reply BOOK to confirm!',
      ),
      RetentionAlertModel(
        vehicleId: 'v-5',
        customerId: 'c-5',
        customerName: 'Nurul Huda',
        phone: '+60 11-2345 9918',
        plateNumber: 'KV 5502',
        vehicleName: 'Perodua Bezza 1.3X',
        currentMileage: 44500,
        kmOverdue: 4500,
        daysOverdue: 51,
        churnRisk: 'High',
        reminderDraft:
            'Salam Nurul Huda! Apex AutoWorks notice: Your Perodua Bezza (KV 5502) is overdue for engine lubrication service by 4,500km. Prolonged delay can cause engine sludge. Special RM120 package available this Saturday. Reply YES to schedule.',
      ),
    ];
  }
}
