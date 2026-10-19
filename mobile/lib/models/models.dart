import 'dart:convert';

class VehicleModel {
  final String id;
  final String plateNumber;
  final String make;
  final String model;
  final int year;
  final int currentMileage;
  final String maintenanceStatus; // 'On Track', 'Due Soon', 'Overdue'
  final DateTime? nextServiceDueDate;
  final int? nextServiceDueMileage;
  final String? customerName;
  final String? customerPhone;

  VehicleModel({
    required this.id,
    required this.plateNumber,
    required this.make,
    required this.model,
    required this.year,
    required this.currentMileage,
    required this.maintenanceStatus,
    this.nextServiceDueDate,
    this.nextServiceDueMileage,
    this.customerName,
    this.customerPhone,
  });

  factory VehicleModel.fromJson(Map<String, dynamic> json, {String? custName, String? custPhone}) {
    return VehicleModel(
      id: json['id']?.toString() ?? '',
      plateNumber: json['plate_number'] ?? '',
      make: json['make'] ?? '',
      model: json['model'] ?? '',
      year: json['year'] is int ? json['year'] : int.tryParse(json['year']?.toString() ?? '2021') ?? 2021,
      currentMileage: json['current_mileage'] is int ? json['current_mileage'] : int.tryParse(json['current_mileage']?.toString() ?? '0') ?? 0,
      maintenanceStatus: json['maintenance_status'] ?? 'On Track',
      nextServiceDueDate: json['next_service_due_date'] != null ? DateTime.tryParse(json['next_service_due_date']) : null,
      nextServiceDueMileage: json['next_service_due_mileage'] is int ? json['next_service_due_mileage'] : null,
      customerName: custName ?? json['customer_name'],
      customerPhone: custPhone ?? json['customer_phone'],
    );
  }
}

class CustomerModel {
  final String id;
  final String fullName;
  final String phone;
  final String email;
  final String address;
  final String status;
  final int healthScore;
  final String churnRisk;
  final String sentiment;
  final double totalSpent;
  final int visitCount;
  final List<VehicleModel> vehicles;

  CustomerModel({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.address,
    required this.status,
    required this.healthScore,
    required this.churnRisk,
    required this.sentiment,
    required this.totalSpent,
    required this.visitCount,
    required this.vehicles,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    var rawVehicles = json['vehicles'] as List? ?? [];
    var vList = rawVehicles.map((v) {
      if (v is Map<String, dynamic>) {
        return VehicleModel.fromJson(v, custName: json['full_name'] ?? json['name'], custPhone: json['phone']);
      }
      return VehicleModel(
        id: 'v-fallback',
        plateNumber: 'Unknown',
        make: 'Unknown',
        model: '',
        year: 2021,
        currentMileage: 0,
        maintenanceStatus: 'On Track',
      );
    }).toList();

    return CustomerModel(
      id: json['id']?.toString() ?? '',
      fullName: json['full_name'] ?? json['name'] ?? 'Automotive Customer',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      address: json['address'] ?? 'Penang, Malaysia',
      status: json['status'] ?? 'Active',
      healthScore: json['health_score'] is int ? json['health_score'] : 80,
      churnRisk: json['churn_risk'] ?? 'Low',
      sentiment: json['sentiment'] ?? 'Positive',
      totalSpent: (json['total_spent'] ?? json['mrr'] ?? 0.0).toDouble(),
      visitCount: json['visit_count'] is int ? json['visit_count'] : 1,
      vehicles: vList,
    );
  }
}

class ServiceOrderModel {
  final String id;
  final String customerName;
  final String vehiclePlate;
  final String serviceType;
  final String stage; // 'Inquiry', 'Scheduled', 'In Progress', 'Quality Inspection', 'Ready for Pickup', 'Invoiced'
  final String serviceBay;
  final String? symptomsReported;
  final String? technicianNotes;
  final double totalAmount;

  ServiceOrderModel({
    required this.id,
    required this.customerName,
    required this.vehiclePlate,
    required this.serviceType,
    required this.stage,
    required this.serviceBay,
    this.symptomsReported,
    this.technicianNotes,
    required this.totalAmount,
  });

  factory ServiceOrderModel.fromJson(Map<String, dynamic> json) {
    return ServiceOrderModel(
      id: json['id']?.toString() ?? '',
      customerName: json['customer_name'] ?? 'Customer',
      vehiclePlate: json['vehicle_plate'] ?? '',
      serviceType: json['service_type'] ?? 'Periodic Maintenance',
      stage: json['stage'] ?? 'Scheduled',
      serviceBay: json['service_bay'] ?? 'Bay 1',
      symptomsReported: json['symptoms_reported'],
      technicianNotes: json['technician_notes'] ?? json['diagnosis'],
      totalAmount: (json['total_amount'] ?? json['value'] ?? 0.0).toDouble(),
    );
  }
}

class RetentionAlertModel {
  final String vehicleId;
  final String customerId;
  final String customerName;
  final String phone;
  final String plateNumber;
  final String vehicleName;
  final int currentMileage;
  final int kmOverdue;
  final int daysOverdue;
  final String churnRisk;
  final String reminderDraft;

  RetentionAlertModel({
    required this.vehicleId,
    required this.customerId,
    required this.customerName,
    required this.phone,
    required this.plateNumber,
    required this.vehicleName,
    required this.currentMileage,
    required this.kmOverdue,
    required this.daysOverdue,
    required this.churnRisk,
    required this.reminderDraft,
  });

  factory RetentionAlertModel.fromJson(Map<String, dynamic> json) {
    return RetentionAlertModel(
      vehicleId: json['vehicle_id']?.toString() ?? '',
      customerId: json['customer_id']?.toString() ?? '',
      customerName: json['customer_name'] ?? 'Car Owner',
      phone: json['phone'] ?? '',
      plateNumber: json['plate_number'] ?? '',
      vehicleName: json['vehicle'] ?? '${json['make'] ?? ''} ${json['model'] ?? ''}'.trim(),
      currentMileage: json['current_mileage'] is int ? json['current_mileage'] : int.tryParse(json['current_mileage']?.toString() ?? '0') ?? 0,
      kmOverdue: json['km_overdue'] is int ? json['km_overdue'] : int.tryParse(json['km_overdue']?.toString() ?? '0') ?? 0,
      daysOverdue: json['days_overdue'] is int ? json['days_overdue'] : int.tryParse(json['days_overdue']?.toString() ?? '0') ?? 0,
      churnRisk: json['churn_risk'] ?? 'High',
      reminderDraft: json['reminder_draft'] ?? 'Friendly maintenance reminder from Apex AutoWorks.',
    );
  }
}
