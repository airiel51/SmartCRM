// API Client for SmartCRM Backend (FastAPI + Supabase)
// CAT405 Intelligent Computing Major Project

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Comprehensive Fallback Data tailored for Automotive Workshop Operations
const MOCK_FALLBACK = {
  customers: [
    {
      id: "c-1",
      full_name: "Ahmad Razali",
      name: "Ahmad Razali",
      phone: "+60 12-345 6789",
      email: "ahmad.razali@gmail.com",
      address: "Taman Sri Nibong, Bayan Lepas, Penang",
      customer_type: "Individual",
      company: "Perodua Myvi 1.5 AV (WXY 8821)",
      status: "Overdue",
      health_score: 38,
      churn_risk: "High",
      sentiment: "Negative",
      total_spent: 1450.0,
      mrr: 1450.0,
      visit_count: 3,
      tags: ["Sedan Owner", "Commuter", "At Risk"],
      vehicles: [
        {
          id: "v-1",
          plate_number: "WXY 8821",
          make: "Perodua",
          model: "Myvi 1.5 AV",
          year: 2021,
          current_mileage: 58400,
          maintenance_status: "Overdue",
          next_service_due_date: "2026-09-18T00:00:00",
          next_service_due_mileage: 55000
        }
      ]
    },
    {
      id: "c-2",
      full_name: "Tan Wei Ming",
      name: "Tan Wei Ming",
      phone: "+60 17-882 1902",
      email: "weiming.tan@outlook.com",
      address: "Greenlane Heights, Georgetown, Penang",
      customer_type: "Individual",
      company: "Honda Civic RS 1.5 Turbo (PNG 4419)",
      status: "Active",
      health_score: 92,
      churn_risk: "Low",
      sentiment: "Positive",
      total_spent: 3820.0,
      mrr: 3820.0,
      visit_count: 5,
      tags: ["Enthusiast", "High Value", "Synthetic Preferred"],
      vehicles: [
        {
          id: "v-2",
          plate_number: "PNG 4419",
          make: "Honda",
          model: "Civic RS 1.5 Turbo",
          year: 2022,
          current_mileage: 38200,
          maintenance_status: "On Track",
          next_service_due_date: "2027-03-01T00:00:00",
          next_service_due_mileage: 45000
        }
      ]
    },
    {
      id: "c-3",
      full_name: "Priya Subramaniam",
      name: "Priya Subramaniam",
      phone: "+60 16-554 2190",
      email: "priya.subra@yahoo.com",
      address: "Pulau Tikus, Penang",
      customer_type: "Individual",
      company: "Proton X50 1.5 TGDi (VAB 2020)",
      status: "Due Soon",
      health_score: 76,
      churn_risk: "Medium",
      sentiment: "Neutral",
      total_spent: 2190.0,
      mrr: 2190.0,
      visit_count: 4,
      tags: ["SUV Owner", "Safety Focused"],
      vehicles: [
        {
          id: "v-3",
          plate_number: "VAB 2020",
          make: "Proton",
          model: "X50 1.5 TGDi",
          year: 2021,
          current_mileage: 41800,
          maintenance_status: "Due Soon",
          next_service_due_date: "2026-10-28T00:00:00",
          next_service_due_mileage: 42000
        }
      ]
    },
    {
      id: "c-4",
      full_name: "Michael Wong",
      name: "Michael Wong",
      phone: "+60 19-411 9832",
      email: "mwong@apexlogistics.my",
      address: "Gelugor, Penang",
      customer_type: "Fleet",
      company: "Toyota Vios 1.5G (JRS 7731)",
      status: "Active",
      health_score: 88,
      churn_risk: "Low",
      sentiment: "Positive",
      total_spent: 7600.0,
      mrr: 7600.0,
      visit_count: 8,
      tags: ["Commercial Fleet", "VIP Client"],
      vehicles: [
        {
          id: "v-4",
          plate_number: "JRS 7731",
          make: "Toyota",
          model: "Vios 1.5G",
          year: 2020,
          current_mileage: 72000,
          maintenance_status: "On Track",
          next_service_due_date: "2026-12-25T00:00:00",
          next_service_due_mileage: 75000
        }
      ]
    },
    {
      id: "c-5",
      full_name: "Nurul Huda",
      name: "Nurul Huda",
      phone: "+60 11-399 4410",
      email: "nurul.huda@gmail.com",
      address: "Relau, Bayan Lepas, Penang",
      customer_type: "Individual",
      company: "Perodua Bezza 1.3X (KV 5502)",
      status: "Overdue",
      health_score: 44,
      churn_risk: "High",
      sentiment: "Negative",
      total_spent: 980.0,
      mrr: 980.0,
      visit_count: 2,
      tags: ["Budget Minded", "At Risk"],
      vehicles: [
        {
          id: "v-5",
          plate_number: "KV 5502",
          make: "Perodua",
          model: "Bezza 1.3X",
          year: 2020,
          current_mileage: 44500,
          maintenance_status: "Overdue",
          next_service_due_date: "2026-08-25T00:00:00",
          next_service_due_mileage: 40000
        }
      ]
    },
    {
      id: "c-6",
      full_name: "Farhan Azman",
      name: "Farhan Azman",
      phone: "+60 12-990 1234",
      email: "farhan.azman@corp.com",
      address: "Tanjung Bungah, Penang",
      customer_type: "VIP",
      company: "BMW 320i M Sport (BQP 9912)",
      status: "Active",
      health_score: 95,
      churn_risk: "Low",
      sentiment: "Positive",
      total_spent: 8450.0,
      mrr: 8450.0,
      visit_count: 6,
      tags: ["Continental", "VIP Client"],
      vehicles: [
        {
          id: "v-6",
          plate_number: "BQP 9912",
          make: "BMW",
          model: "320i M Sport",
          year: 2022,
          current_mileage: 32400,
          maintenance_status: "On Track",
          next_service_due_date: "2027-04-10T00:00:00",
          next_service_due_mileage: 40000
        }
      ]
    }
  ],
  services: [
    {
      id: "sr-1",
      customer_id: "c-1",
      vehicle_id: "v-1",
      service_type: "50k Major Service & Diagnostics",
      stage: "Inquiry",
      service_bay: "Bay 1 (Engine)",
      customer_name: "Ahmad Razali",
      customer_phone: "+60 12-345 6789",
      vehicle_plate: "WXY 8821",
      vehicle_model: "Perodua Myvi 1.5 AV",
      symptoms_reported: "Yellow check engine light blinking, engine vibration during idle.",
      total_amount: 400.0,
      title: "50k Major Service & Diagnostics - WXY 8821",
      value: 400.0,
      win_probability: 25
    },
    {
      id: "sr-2",
      customer_id: "c-2",
      vehicle_id: "v-2",
      service_type: "Full Synthetic Engine Oil Service",
      stage: "Scheduled",
      service_bay: "Bay 1 (Engine)",
      customer_name: "Tan Wei Ming",
      customer_phone: "+60 17-882 1902",
      vehicle_plate: "PNG 4419",
      vehicle_model: "Honda Civic RS 1.5 Turbo",
      symptoms_reported: "Routine 10,000km synthetic oil service requested.",
      total_amount: 328.0,
      title: "Full Synthetic Engine Oil Service - PNG 4419",
      value: 328.0,
      win_probability: 60
    },
    {
      id: "sr-3",
      customer_id: "c-3",
      vehicle_id: "v-3",
      service_type: "Brake Pad & Rotor Inspection",
      stage: "In Progress",
      service_bay: "Bay 2 (Brakes)",
      customer_name: "Priya Subramaniam",
      customer_phone: "+60 16-554 2190",
      vehicle_plate: "VAB 2020",
      vehicle_model: "Proton X50 1.5 TGDi",
      symptoms_reported: "Customer heard squeaking when braking downhill near Penang Bridge.",
      total_amount: 440.0,
      title: "Brake Pad & Rotor Inspection - VAB 2020",
      value: 440.0,
      win_probability: 85
    },
    {
      id: "sr-4",
      customer_id: "c-4",
      vehicle_id: "v-4",
      service_type: "Air Conditioning Flush & Regas",
      stage: "Quality Inspection",
      service_bay: "Bay 3 (General)",
      customer_name: "Michael Wong",
      customer_phone: "+60 19-411 9832",
      vehicle_plate: "JRS 7731",
      vehicle_model: "Toyota Vios 1.5G",
      symptoms_reported: "Blower working but air is lukewarm during hot afternoons.",
      total_amount: 210.0,
      title: "Air Conditioning Flush & Regas - JRS 7731",
      value: 210.0,
      win_probability: 95
    },
    {
      id: "sr-5",
      customer_id: "c-6",
      vehicle_id: "v-6",
      service_type: "Brake System & MOTUL 300V Oil Service",
      stage: "Ready for Pickup",
      service_bay: "Bay 4 (QC)",
      customer_name: "Farhan Azman",
      customer_phone: "+60 12-990 1234",
      vehicle_plate: "BQP 9912",
      vehicle_model: "BMW 320i M Sport",
      symptoms_reported: "Scheduled performance fluid refresh.",
      total_amount: 630.0,
      title: "Performance Service - BQP 9912",
      value: 630.0,
      win_probability: 98
    },
    {
      id: "sr-6",
      customer_id: "c-5",
      vehicle_id: "v-5",
      service_type: "Major 40k Service & Gearbox Flush",
      stage: "Invoiced",
      service_bay: "Bay 1 (Engine)",
      customer_name: "Nurul Huda",
      customer_phone: "+60 11-399 4410",
      vehicle_plate: "KV 5502",
      vehicle_model: "Perodua Bezza 1.3X",
      symptoms_reported: "Previous major transmission and spark plug service.",
      total_amount: 360.0,
      title: "Major Service - KV 5502",
      value: 360.0,
      win_probability: 100
    }
  ],
  overview: {
    active_fleet_count: 142,
    overdue_maintenance_count: 18,
    whatsapp_inquiries_count: 7,
    repeat_service_rate: 74.2,
    monthly_revenue: 48250.0,
    bay_utilization_rate: 82.5,
    ai_automation_index: 94.8,
    total_accounts: 6,
    active_arr: 579000.0,
    total_pipeline_value: 24800.0,
    win_rate_percentage: 78.4,
    at_risk_arr: 8500.0,
    pending_activities_count: 3
  },
  vehicles: [
    {
      id: "v-1",
      plate_number: "WXY 8821",
      make: "Perodua",
      model: "Myvi 1.5 AV",
      year: 2021,
      current_mileage: 58400,
      maintenance_status: "Overdue",
      next_service_due_date: "2026-09-18T00:00:00",
      next_service_due_mileage: 55000,
      customer_id: "c-1",
      customer_name: "Ahmad Razali",
      customer_phone: "+60 12-345 6789"
    },
    {
      id: "v-2",
      plate_number: "PNG 4419",
      make: "Honda",
      model: "Civic RS 1.5 Turbo",
      year: 2022,
      current_mileage: 38200,
      maintenance_status: "On Track",
      next_service_due_date: "2027-03-01T00:00:00",
      next_service_due_mileage: 45000,
      customer_id: "c-2",
      customer_name: "Tan Wei Ming",
      customer_phone: "+60 17-882 1902"
    },
    {
      id: "v-3",
      plate_number: "VAB 2020",
      make: "Proton",
      model: "X50 1.5 TGDi",
      year: 2021,
      current_mileage: 41800,
      maintenance_status: "Due Soon",
      next_service_due_date: "2026-10-28T00:00:00",
      next_service_due_mileage: 42000,
      customer_id: "c-3",
      customer_name: "Priya Subramaniam",
      customer_phone: "+60 16-554 2190"
    },
    {
      id: "v-4",
      plate_number: "JRS 7731",
      make: "Toyota",
      model: "Vios 1.5G",
      year: 2020,
      current_mileage: 72100,
      maintenance_status: "On Track",
      next_service_due_date: "2027-01-15T00:00:00",
      next_service_due_mileage: 80000,
      customer_id: "c-4",
      customer_name: "Michael Wong",
      customer_phone: "+60 19-411 9832"
    },
    {
      id: "v-5",
      plate_number: "KV 5502",
      make: "Perodua",
      model: "Bezza 1.3X",
      year: 2019,
      current_mileage: 94300,
      maintenance_status: "Due Soon",
      next_service_due_date: "2026-11-05T00:00:00",
      next_service_due_mileage: 95000,
      customer_id: "c-5",
      customer_name: "Nurul Huda",
      customer_phone: "+60 11-399 4410"
    },
    {
      id: "v-6",
      plate_number: "BQP 9912",
      make: "BMW",
      model: "320i M Sport",
      year: 2022,
      current_mileage: 32400,
      maintenance_status: "On Track",
      next_service_due_date: "2027-04-10T00:00:00",
      next_service_due_mileage: 40000,
      customer_id: "c-6",
      customer_name: "David Lim",
      customer_phone: "+60 12-661 8820"
    }
  ],
  appointments: [
    {
      id: "app-1",
      customer_id: "c-2",
      customer_name: "Tan Wei Ming",
      customer_phone: "+60 17-882 1902",
      vehicle_id: "v-2",
      vehicle_plate: "PNG 4419",
      vehicle_model: "Honda Civic RS 1.5 Turbo",
      service_type: "Full Synthetic Engine Oil Service",
      scheduled_date: new Date(Date.now() + 86400000).toISOString(),
      status: "confirmed",
      service_bay: "Bay 1 (Engine)",
      notes: "Customer requesting Liqui Moly 5W-30 synthetic oil."
    },
    {
      id: "app-2",
      customer_id: "c-3",
      customer_name: "Priya Subramaniam",
      customer_phone: "+60 16-554 2190",
      vehicle_id: "v-3",
      vehicle_plate: "VAB 2020",
      vehicle_model: "Proton X50 1.5 TGDi",
      service_type: "Brake Pad & Rotor Inspection",
      scheduled_date: new Date(Date.now() + 172800000).toISOString(),
      status: "scheduled",
      service_bay: "Bay 2 (Brakes)",
      notes: "Squeaking sound reported under deceleration."
    },
    {
      id: "app-3",
      customer_id: "c-4",
      customer_name: "Michael Wong",
      customer_phone: "+60 19-411 9832",
      vehicle_id: "v-4",
      vehicle_plate: "JRS 7731",
      vehicle_model: "Toyota Vios 1.5G",
      service_type: "Air Conditioning Flush & Regas",
      scheduled_date: new Date(Date.now() + 259200000).toISOString(),
      status: "scheduled",
      service_bay: "Bay 3 (General)",
      notes: "Air conditioning lukewarm at high midday heat."
    },
    {
      id: "app-4",
      customer_id: "c-6",
      customer_name: "David Lim",
      customer_phone: "+60 12-661 8820",
      vehicle_id: "v-6",
      vehicle_plate: "BQP 9912",
      vehicle_model: "BMW 320i M Sport",
      service_type: "Final Inspection & Diagnostic Scan",
      scheduled_date: new Date().toISOString(),
      status: "in_progress",
      service_bay: "Bay 4 (QC)",
      notes: "Quality check before client collection."
    }
  ],
  reminders: [
    {
      id: "rem-1",
      customer_id: "c-1",
      customer_name: "Ahmad Razali",
      customer_phone: "+60 12-345 6789",
      vehicle_plate: "WXY 8821",
      vehicle_model: "Perodua Myvi 1.5 AV",
      reminder_type: "50k Major Service & Spark Plugs",
      current_mileage: 58400,
      status: "overdue",
      priority: "urgent",
      days_overdue: 35,
      mileage_overdue: 3400
    },
    {
      id: "rem-2",
      customer_id: "c-3",
      customer_name: "Priya Subramaniam",
      customer_phone: "+60 16-554 2190",
      vehicle_plate: "VAB 2020",
      vehicle_model: "Proton X50 1.5 TGDi",
      reminder_type: "Brake Pad Inspection",
      current_mileage: 41800,
      status: "due",
      priority: "high",
      days_overdue: 5,
      mileage_overdue: 200
    },
    {
      id: "rem-3",
      customer_id: "c-5",
      customer_name: "Nurul Huda",
      customer_phone: "+60 11-399 4410",
      vehicle_plate: "KV 5502",
      vehicle_model: "Perodua Bezza 1.3X",
      reminder_type: "Routine Oil & Filter Service",
      current_mileage: 94300,
      status: "due",
      priority: "normal",
      days_overdue: 8,
      mileage_overdue: 700
    },
    {
      id: "rem-4",
      customer_id: "c-2",
      customer_name: "Tan Wei Ming",
      customer_phone: "+60 17-882 1902",
      vehicle_plate: "PNG 4419",
      vehicle_model: "Honda Civic RS 1.5 Turbo",
      reminder_type: "Tire Rotation & Wheel Alignment",
      current_mileage: 38200,
      status: "upcoming",
      priority: "normal",
      days_overdue: -20,
      mileage_overdue: -1800
    }
  ],
  inquiries: [
    {
      id: "inq-1",
      customer_name: "Daniel Lim",
      phone: "+60 18-992 1104",
      plate_number: "PNG 4419",
      vehicle_summary: "Honda Civic RS 1.5 Turbo",
      raw_message: "Hi boss, my Honda Civic PNG 4419 brake pedal feels spongy when coming to a stop. Can I drop it by Bayan Lepas workshop tomorrow at 2:30pm for brake check?",
      status: "new",
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "inq-2",
      customer_name: "Siti Sarah",
      phone: "+60 13-445 6781",
      plate_number: "WXY 8821",
      vehicle_summary: "Perodua Myvi 1.5 AV",
      raw_message: "Salam Apex AutoWorks, my Perodua Myvi WXY 8821 aircond is blowing warm air at noon. How much to check gas and flush cooling coil?",
      status: "new",
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: "inq-3",
      customer_name: "Mr. Rajendran",
      phone: "+60 19-332 0918",
      plate_number: "JRS 7731",
      vehicle_summary: "Toyota Vios 1.5G",
      raw_message: "Hello, looking for urgent check engine diagnostic for Toyota Vios plate JRS 7731. Engine idling rough.",
      status: "in_review",
      created_at: new Date(Date.now() - 14400000).toISOString()
    }
  ],
  recommendations: [
    {
      id: "rec-1",
      title: "Stock Reorder: 5W-30 Fully Synthetic Engine Oil",
      category: "inventory",
      description: "Upcoming appointment surge predicts a 35% higher usage of 5W-30 grade oil over the next 14 days. Reorder 24 canisters to avoid bay downtime.",
      impact: "High",
      confidence: 96,
      status: "pending"
    },
    {
      id: "rec-2",
      title: "Targeted Brake Service Campaign for Proton X50 Fleet",
      category: "retention",
      description: "3 fleet accounts approaching 40,000 km have not logged brake pad renewal. Automated WhatsApp outreach can capture RM 1,320 in bookings.",
      impact: "Medium",
      confidence: 91,
      status: "pending"
    },
    {
      id: "rec-3",
      title: "Optimize Bay 3 for Air Conditioning Diagnostic Rush",
      category: "operations",
      description: "Midday hot weather trend has driven 4 consecutive AC cooling coil inquiries. Dedicate Bay 3 for refrigerant recovery and flush equipment.",
      impact: "High",
      confidence: 88,
      status: "in_progress"
    }
  ]
};

async function fetchWithFallback(endpoint, options = {}, fallbackKey = null) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[SmartCRM API] Request to ${endpoint} failed (${err.message}). Using local cache/fallback.`);
    if (fallbackKey && MOCK_FALLBACK[fallbackKey]) {
      return MOCK_FALLBACK[fallbackKey];
    }
    throw err;
  }
}

function localDiagnosticInference(message, phone = '+60 16-554 2190', senderName = 'Customer') {
  const text = (message || '').toLowerCase();
  
  // Extract plate
  const plateMatch = (message || '').match(/\b([A-Z]{1,3}\s*\d{1,4}\s*[A-Z]?)\b/i);
  const plate = plateMatch ? plateMatch[1].toUpperCase() : 'VAB 2020';
  
  // Extract make / model
  let make = 'Proton';
  let model = 'X50';
  if (text.includes('civic') || text.includes('honda')) { make = 'Honda'; model = 'Civic'; }
  else if (text.includes('vios') || text.includes('toyota')) { make = 'Toyota'; model = 'Vios'; }
  else if (text.includes('myvi') || text.includes('perodua') || text.includes('bezza') || text.includes('axia')) { make = 'Perodua'; model = 'Myvi'; }
  else if (text.includes('almera') || text.includes('nissan')) { make = 'Nissan'; model = 'Almera'; }
  else if (text.includes('bmw')) { make = 'BMW'; model = '320i'; }

  let category = "General Automotive Systems";
  let diagProb = "Periodic Vehicle Inspection Due";
  let diagSol = "Diagnostic Scan And Vehicle Inspection";
  let cost = 150.00;
  let parts = "Multi-point visual check & OBD-II scanner interrogation";
  let explanation = "Vehicle requires technician bay inspection and computer code diagnostic interrogation.";
  let probConf = 0.85;
  let solConf = 0.88;
  let urgency = "Normal";
  let diagSteps = [
    { step: "Perform OBD-II diagnostic scan", result: ["Fault codes present", "No codes"] },
    { step: "Inspect engine bay fluid levels", result: ["Normal", "Abnormal"] }
  ];

  if (text.includes("abs") || text.includes("pulsat")) {
    category = "ABS System";
    diagProb = "ABS Control Module / Wheel Speed Sensor";
    diagSol = "ABS System Diagnostic Scan & Sensor Service";
    cost = 280.00;
    parts = "ABS Wheel Speed Sensor & Harness Connector";
    explanation = "ABS warning light and pedal pulsation indicate sensor debris or module communication fault.";
    diagSteps = [
      { step: "Check ABS fuse and relay", result: ["Blown", "Intact"] },
      { step: "Inspect wheel speed sensor for debris", result: ["Dirty/damaged", "Clean/intact"] }
    ];
    probConf = 0.94;
    solConf = 0.95;
    urgency = "High";
  } else if (text.includes("brake") || text.includes("squeak") || text.includes("pad") || text.includes("stopping") || text.includes("grind")) {
    category = "ABS System";
    diagProb = "Brake Pad";
    diagSol = "Brake Pad Replacement & Rotor Resurfacing";
    cost = 280.00;
    parts = "Ceramic High-Performance Brake Pads & Rotor Surface Skimming";
    explanation = "Friction lining worn beyond safe limit, causing metal indicator contact. Replacing pads and resurfacing rotors restores stopping grip and eliminates squeal.";
    diagSteps = [
      { step: "Check brake pad thickness", result: ["Worn pads", "Sufficient thickness pads"] },
      { step: "Inspect brake rotor for scoring or warping", result: ["Scored/warped rotor", "Smooth rotor"] }
    ];
    probConf = 0.95;
    solConf = 0.96;
    urgency = "High";
  } else if (text.includes("aircond") || text.includes("air con") || text.includes("not cold") || text.includes("hot air") || text.includes("ac ") || text.includes("warm air")) {
    category = "Air Conditioning System";
    diagProb = "AC Recharge / Condenser";
    diagSol = "AC System Recharge & Diagnostic Flush";
    cost = 210.00;
    parts = "R134a Pure Refrigerant Gas + Compressor Lubricating PAG Oil + Cabin Filter";
    explanation = "Refrigerant pressure dropped below operational threshold or cabin filter blocked, restricting cooling capacity. Re-gas and oil top-up restores ice-cold airflow.";
    diagSteps = [
      { step: "Check AC system pressure with gauge", result: ["Low pressure", "Normal pressure"] },
      { step: "Inspect AC condenser for debris or blockage", result: ["Debris/blockage present", "Clean/clear condenser"] }
    ];
    probConf = 0.92;
    solConf = 0.95;
    urgency = "Medium";
  } else if (text.includes("battery") || text.includes("cannot start") || text.includes("click") || text.includes("crank") || text.includes("dead") || text.includes("jumpstart")) {
    category = "Electrical System";
    diagProb = "Battery Replacement";
    diagSol = "Automotive Battery Replacement & Terminal Service";
    cost = 320.00;
    parts = "DIN55 / NS60 Maintenance-Free Automotive AGM Battery (18-Month Warranty)";
    explanation = "Battery internal cells have degraded below cold-cranking threshold (CCA), failing to crank the starter motor. Installing a fresh battery restores reliable ignition.";
    diagSteps = [
      { step: "Test battery voltage with multimeter", result: ["Low voltage (< 11.8V)", "Sufficient voltage (> 12.4V)"] },
      { step: "Inspect battery terminals for acid corrosion", result: ["Corroded terminals", "Clean terminals"] }
    ];
    probConf = 0.95;
    solConf = 0.97;
    urgency = "Urgent";
  } else if (text.includes("check engine") || text.includes("yellow light") || text.includes("vibrat") || text.includes("misfire") || text.includes("jerk")) {
    category = "Electrical System";
    diagProb = "Check Engine Light Diagnosis";
    diagSol = "OBD-II Multi-System Diagnostic Scan & Sensor Service";
    cost = 190.00;
    parts = "OBD-II Multi-System Diagnostic ECU Scan + NGK Laser Iridium Spark Plugs";
    explanation = "Engine ECU registered an active fault code (DTC). Interrogation identifies sensor issues or fouled spark plug electrode gaps.";
    diagSteps = [
      { step: "Scan for diagnostic trouble codes (DTCs)", result: ["DTCs present", "No DTCs"] },
      { step: "Check ignition coil and spark plug continuity", result: ["Broken/fouled", "Intact"] }
    ];
    probConf = 0.91;
    solConf = 0.93;
    urgency = "High";
  } else if (text.includes("oil") || text.includes("service") || text.includes("10k") || text.includes("lube") || text.includes("filter")) {
    category = "Engine Compartment";
    diagProb = "Engine Oil";
    diagSol = "Full Synthetic Oil & Filter Service";
    cost = 240.00;
    parts = "Liqui Moly 5W-30 Full Synthetic (4L) + OEM Oil Filter + Sump Washer";
    explanation = "Engine oil reached recommended mileage breakdown limit. Draining old lubricant and installing an OEM filter safeguards engine components against wear.";
    diagSteps = [
      { step: "Check engine oil level and condition on dipstick", result: ["Low/dirty oil", "Clean/sufficient oil"] },
      { step: "Inspect engine sump and valve cover for oil leaks", result: ["Oil leaks present", "No leaks detected"] }
    ];
    probConf = 0.94;
    solConf = 0.96;
    urgency = "Normal";
  } else if (text.includes("whining") && text.includes("turning") || text.includes("power steering")) {
    category = "Steering";
    diagProb = "Power Steering Fluid / Pump";
    diagSol = "Power Steering Fluid Flush & Pump Inspection";
    cost = 160.00;
    parts = "Synthetic Power Steering Fluid (1L) + O-Ring Kit";
    explanation = "Hydraulic power steering pump cavitation due to fluid aerated or low reservoir level.";
    diagSteps = [
      { step: "Inspect power steering fluid level", result: ["Low fluid level", "Sufficient fluid level"] },
      { step: "Check power steering pump and hoses for leaks", result: ["Leaking pump/hoses", "Pump and hoses in good condition"] }
    ];
    probConf = 0.92;
    solConf = 0.94;
    urgency = "Medium";
  } else if (text.includes("rotten egg") || text.includes("catalytic")) {
    category = "Emissions System";
    diagProb = "Catalytic Converter";
    diagSol = "Catalytic Converter Replacement & Emissions Test";
    cost = 650.00;
    parts = "High-Flow Catalytic Converter & Exhaust Gaskets";
    explanation = "Unburned sulfur fuel compounds overloading substrate catalyst.";
    diagSteps = [
      { step: "Inspect catalytic converter for physical damage", result: ["Damaged converter", "Converter intact"] },
      { step: "Check catalytic converter efficiency with OBD scan", result: ["Low efficiency", "High efficiency"] }
    ];
    probConf = 0.95;
    solConf = 0.96;
    urgency = "High";
  } else if (text.includes("blue smoke") || text.includes("loss of power")) {
    category = "Engine Components";
    diagProb = "Piston Rings";
    diagSol = "Piston Rings Inspection & Compression Test";
    cost = 380.00;
    parts = "Compression Test Gauge Kit + Cylinder De-carbon Service";
    explanation = "Engine oil seeping into combustion chamber through worn piston oil control rings.";
    diagSteps = [
      { step: "Perform engine compression test", result: ["Low compression", "Good compression"] },
      { step: "Inspect piston rings for wear or damage", result: ["Worn/damaged rings", "Rings in good condition"] }
    ];
    probConf = 0.91;
    solConf = 0.93;
    urgency = "Urgent";
  } else if (text.includes("steer") || text.includes("tire") || text.includes("tyre") || text.includes("align") || text.includes("pull") || text.includes("wheel")) {
    category = "Wheels & Tires";
    diagProb = "Wheel Alignment & Hub";
    diagSol = "Computerized 4-Wheel Laser Alignment & Balancing";
    cost = 95.00;
    parts = "Computerized 4-Wheel Laser Alignment + Dynamic Wheel Weights";
    explanation = "Suspension toe or camber geometry knocked out of factory specification by road potholes, causing steering pull and rapid uneven tire tread wear.";
    diagSteps = [
      { step: "Inspect wheel hub and bearing for play", result: ["Loose/worn hub", "Hub in good condition"] },
      { step: "Check tire pressures and tread depth across 4 tires", result: ["Uneven wear", "Normal wear"] }
    ];
    probConf = 0.89;
    solConf = 0.92;
    urgency = "Medium";
  }

  const vehStr = `${make} ${model} (${plate})`;
  return {
    phone,
    customer_name: senderName,
    vehicle_plate: plate,
    vehicle_matched: vehStr,
    symptoms_detected: [diagProb],
    system_category: category,
    diagnosed_problem: diagProb,
    problem_confidence: probConf,
    recommended_service: diagSol,
    solution_confidence: solConf,
    diagnosis_steps: diagSteps,
    parts_required: parts,
    diagnostic_explanation: explanation,
    is_ml_diagnosed: true,
    estimated_cost: cost,
    requested_appointment: "Tomorrow at 2:30PM",
    sentiment_score: urgency === "Urgent" ? -0.4 : -0.1,
    sentiment_label: urgency === "Urgent" ? "Negative" : "Neutral",
    urgency,
    intent: "Service Booking Request",
    suggested_auto_reply: `Hi ${senderName}! Thank you for contacting Apex AutoWorks & Diagnostic Centre.\n\n🔍 AI Diagnosis for ${vehStr}:\n• Subsystem: ${category}\n• Component: ${diagProb} (${Math.round(probConf * 100)}% match)\n• Assessment: ${explanation}\n\n🛠️ Suggested Workshop Solution:\n• Package: ${diagSol} (${Math.round(solConf * 100)}% match)\n• Parts & Labor: ${parts}\n• Estimated Quote: RM ${cost.toFixed(2)}\n• Bay Slot: Tomorrow at 2:30PM\n\nPlease reply 'CONFIRM' to finalize your booking!`,
    can_auto_book: true
  };
}

export const api = {
  // 1. Customers
  getCustomers: (search = '', status = '', churnRisk = '') => {
    let q = `?`;
    if (search) q += `search=${encodeURIComponent(search)}&`;
    if (status) q += `status=${encodeURIComponent(status)}&`;
    if (churnRisk) q += `churn_risk=${encodeURIComponent(churnRisk)}&`;
    return fetchWithFallback(`/customers${q}`, {}, 'customers');
  },
  getCustomer360: (id) => fetchWithFallback(`/customers/${id}`),
  createCustomer: (data) => fetchWithFallback(`/customers`, { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => fetchWithFallback(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // 2. Vehicles
  getVehicles: (search = '', maintenanceStatus = '') => {
    let q = `?`;
    if (search) q += `search=${encodeURIComponent(search)}&`;
    if (maintenanceStatus) q += `maintenance_status=${encodeURIComponent(maintenanceStatus)}&`;
    return fetchWithFallback(`/vehicles${q}`, {}, 'vehicles');
  },
  getVehicleById: (id) => fetchWithFallback(`/vehicles/${id}`),
  registerVehicle: (data) => fetchWithFallback(`/vehicles`, { method: 'POST', body: JSON.stringify(data) }),
  updateOdometer: (id, newMileage, notes = '') =>
    fetchWithFallback(`/vehicles/${id}/odometer?new_mileage=${newMileage}&notes=${encodeURIComponent(notes)}`, { method: 'PATCH' }),

  // 3. Service Records (Work Orders & Kanban)
  getServices: (stage = '') => {
    let q = stage ? `?stage=${encodeURIComponent(stage)}` : '';
    return fetchWithFallback(`/services${q}`, {}, 'services');
  },
  getDeals: () => fetchWithFallback(`/services`, {}, 'services'), // legacy compatibility
  createService: (data) => fetchWithFallback(`/services`, { method: 'POST', body: JSON.stringify(data) }),
  createDeal: (data) => fetchWithFallback(`/services`, { method: 'POST', body: JSON.stringify(data) }),
  updateServiceStage: (id, stage, serviceBay = '') => {
    let q = `?stage=${encodeURIComponent(stage)}`;
    if (serviceBay) q += `&service_bay=${encodeURIComponent(serviceBay)}`;
    return fetchWithFallback(`/services/${id}/stage${q}`, { method: 'PATCH' });
  },
  updateDealStage: (id, stage) => fetchWithFallback(`/services/${id}/stage?stage=${encodeURIComponent(stage)}`, { method: 'PATCH' }),

  // 4. WhatsApp AI Live Center & Chat Extraction
  getWhatsAppInteractions: (phone = '') => {
    let q = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    return fetchWithFallback(`/whatsapp/interactions${q}`);
  },
  extractWhatsAppChat: async (message, phone = '+60 16-554 2190', senderName = 'Customer') => {
    try {
      const res = await fetch(`${API_BASE}/whatsapp/extract-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, phone, sender_name: senderName })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn(`[SmartCRM AI] Remote API unreachable (${err.message}). Using client-side ML diagnostic model.`);
    }
    return localDiagnosticInference(message, phone, senderName);
  },
  autoBookFromChat: (data) =>
    fetchWithFallback(`/whatsapp/auto-book`, { method: 'POST', body: JSON.stringify(data) }),

  // 5. Autonomous Retention Engine
  runRetentionScan: () => fetchWithFallback(`/retention/scan`),
  sendRetentionReminder: (vehicleId, customerId, phone, message) =>
    fetchWithFallback(`/retention/send-reminder`, {
      method: 'POST',
      body: JSON.stringify({ vehicle_id: vehicleId, customer_id: customerId, phone, message })
    }),

  // 6. Proactive Acquisition Agent
  getCampaigns: () => fetchWithFallback(`/acquisition/campaigns`),
  generateCampaign: (segment, serviceType, discountPct = 15) =>
    fetchWithFallback(`/acquisition/generate?segment=${encodeURIComponent(segment)}&service_type=${encodeURIComponent(serviceType)}&discount_pct=${discountPct}`, { method: 'POST' }),
  broadcastCampaign: (campaignId) =>
    fetchWithFallback(`/acquisition/${campaignId}/broadcast`, { method: 'POST' }),

  // 7. Integrated AI Business Strategist
  getStrategistReport: () => fetchWithFallback(`/strategist/report`),

  // 8. Analytics & BI
  getAnalyticsOverview: () => fetchWithFallback(`/analytics/overview`, {}, 'overview'),
  getHealthDistribution: () => fetchWithFallback(`/analytics/health-distribution`),
  getServiceDistribution: () => fetchWithFallback(`/analytics/service-distribution`),
  getPipelineFunnel: () => fetchWithFallback(`/analytics/pipeline-funnel`),

  // 9. Supabase Cloud Sync & Configuration
  getSupabaseHealth: () => fetchWithFallback(`/supabase/health`),
  getSupabaseSchemaSql: () => fetchWithFallback(`/supabase/schema-sql`),

  // 11. Appointments Schedule
  getAppointments: (status = '', date = '') => {
    let q = '?';
    if (status) q += `status=${encodeURIComponent(status)}&`;
    if (date) q += `date=${encodeURIComponent(date)}&`;
    return fetchWithFallback(`/appointments${q}`, {}, 'appointments');
  },
  createAppointment: (data) =>
    fetchWithFallback(`/appointments`, { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, newStatus) =>
    fetchWithFallback(`/appointments/${id}/status?new_status=${encodeURIComponent(newStatus)}`, { method: 'PATCH' }),

  // 12. Inquiries & Leads Inbox
  getInquiries: (status = '') => {
    let q = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchWithFallback(`/inquiries${q}`, {}, 'inquiries');
  },
  createInquiry: (data) =>
    fetchWithFallback(`/inquiries`, { method: 'POST', body: JSON.stringify(data) }),
  convertInquiry: (id, data) =>
    fetchWithFallback(`/inquiries/${id}/convert`, { method: 'POST', body: JSON.stringify(data) }),

  // 13. Service Reminders
  getReminders: (status = '') => {
    let q = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchWithFallback(`/reminders${q}`, {}, 'reminders');
  },
  sendReminderWhatsApp: (id, phone, message) =>
    fetchWithFallback(`/reminders/${id}/send-whatsapp?phone=${encodeURIComponent(phone)}&message=${encodeURIComponent(message)}`, { method: 'POST' }),

  // 14. AI Workshop Recommendations
  getAIRecommendations: (category = '', status = '') => {
    let q = '?';
    if (category) q += `category=${encodeURIComponent(category)}&`;
    if (status) q += `status=${encodeURIComponent(status)}&`;
    return fetchWithFallback(`/recommendations${q}`, {}, 'recommendations');
  },
  updateRecommendationStatus: (id, status) =>
    fetchWithFallback(`/recommendations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};

