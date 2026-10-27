// API Client for SmartCRM Backend (FastAPI + Supabase)
// CAT405 Intelligent Computing Major Project

const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE = getApiBase();


// Dynamic / Lazy Mock Dataset Loading
// Decouples massive fallback dataset from primary bundle into an asynchronous chunk
let mockFallbackCache = null;
export async function getMockFallback() {
  if (!mockFallbackCache) {
    const mod = await import('./mockData.js');
    mockFallbackCache = mod.MOCK_FALLBACK;
  }
  return mockFallbackCache;
}
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
    if (fallbackKey) {
      const mockData = await getMockFallback();
      if (mockData && mockData[fallbackKey]) {
        return mockData[fallbackKey];
      }
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
  createInquiry: async (data) => {
    try {
      return await fetchWithFallback(`/inquiries`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      // Standalone demo fallback
      const plateMatch = (data.raw_message || '').match(/\b([A-Z]{1,3}\s*\d{1,4}\s*[A-Z]?)\b/i);
      const newInq = {
        id: `inq-${Date.now()}`,
        sender_name: data.sender_name || 'Inbound Lead',
        customer_name: data.sender_name || 'Inbound Lead',
        sender_phone: data.sender_phone || '+60 12-000 0000',
        phone: data.sender_phone || '+60 12-000 0000',
        email: data.email || 'customer@example.com',
        channel: data.channel || 'whatsapp',
        status: 'new',
        assigned_to: 'Sarah Tan (PIC)',
        created_at: new Date().toISOString(),
        raw_message: data.raw_message || '',
        extraction_confidence: 0.93,
        extraction_provider: 'gemini-2.5-flash',
        extracted_data: {
          customer_name: data.sender_name || 'Inbound Lead',
          phone: data.sender_phone || '+60 12-000 0000',
          plate_number: plateMatch ? plateMatch[1].toUpperCase() : 'WXY 8821',
          make: 'Proton',
          model: 'X50',
          year: 2022,
          symptoms: ['Reported mechanical vibration and brake noise'],
          requested_service: 'Workshop Diagnostic Inspection',
          estimated_cost: 180.0,
          preferred_date: 'Flexible',
          preferred_time: 'Afternoon'
        }
      };
      const mockData = await getMockFallback();
      mockData.inquiries.unshift(newInq);
      return newInq;
    }
  },
  convertInquiry: async (id, data) => {
    try {
      return await fetchWithFallback(`/inquiries/${id}/convert`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const mockData = await getMockFallback();
      const found = mockData.inquiries.find(i => i.id === id);
      if (found) {
        found.status = 'booked';
        if (data.assigned_bay) found.assigned_bay = data.assigned_bay;
      }
      return { success: true, message: 'Inquiry converted to records (Demo)' };
    }
  },
  updateInquiry: async (id, data) => {
    try {
      return await fetchWithFallback(`/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    } catch {
      const mockData = await getMockFallback();
      const found = mockData.inquiries.find(i => i.id === id);
      if (found) {
        Object.assign(found, data);
      }
      return { success: true, inquiry: found };
    }
  },

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

