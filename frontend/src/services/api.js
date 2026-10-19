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
  }
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
    return fetchWithFallback(`/vehicles${q}`);
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
  extractWhatsAppChat: (message, phone = '+60 16-554 2190', senderName = 'Customer') =>
    fetchWithFallback(`/whatsapp/extract-chat`, {
      method: 'POST',
      body: JSON.stringify({ message, phone, sender_name: senderName })
    }),
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

  // 10. AI Copilot
  copilotChat: (query, customerId = null, vehicleId = null) =>
    fetchWithFallback(`/agents/copilot-chat`, {
      method: 'POST',
      body: JSON.stringify({ query, context_customer_id: customerId, context_vehicle_id: vehicleId })
    }),
  auditCustomer: (customerId) => fetchWithFallback(`/agents/audit/${customerId}`, { method: 'POST' }),
  auditAllCustomers: () => fetchWithFallback(`/agents/audit-all`, { method: 'POST' }),
  executeAction: (data) => fetchWithFallback(`/agents/execute-action`, { method: 'POST', body: JSON.stringify(data) })
};
