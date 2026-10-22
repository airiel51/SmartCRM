-- =============================================================================
-- SmartCRM: Intelligent Automotive Workshop Customer Relationship Management
-- Supabase PostgreSQL Relational Schema with Row-Level Security (RLS)
-- Multi-Tenant Scoping, Role-Based Access Control, Realtime Publications & Seed Data
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in dependency order for clean migrations
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS service_reminders CASCADE;
DROP TABLE IF EXISTS communication_logs CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS mileage_logs CASCADE;
DROP TABLE IF EXISTS service_jobs CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS workshop_members CASCADE;
DROP TABLE IF EXISTS workshops CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Workshops (Tenant / Organization Scope)
-- -----------------------------------------------------------------------------
CREATE TABLE workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    registration_no VARCHAR(50),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'MYR',
    currency_symbol VARCHAR(5) NOT NULL DEFAULT 'RM',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kuala_Lumpur',
    service_intervals JSONB NOT NULL DEFAULT '{
        "oil_km": 5000,
        "oil_days": 180,
        "synthetic_km": 10000,
        "synthetic_days": 365,
        "brake_km": 20000,
        "brake_days": 730,
        "major_km": 40000,
        "major_days": 730
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workshops_active ON workshops(is_active);

-- -----------------------------------------------------------------------------
-- 2. Workshop Members & Staff Profiles (Role-Aware Authorization)
-- -----------------------------------------------------------------------------
CREATE TABLE workshop_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    auth_user_id UUID, -- Links to Supabase auth.users if available
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'pic' CHECK (role IN ('owner', 'admin', 'pic', 'technician')),
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(workshop_id, email)
);

CREATE INDEX idx_members_workshop ON workshop_members(workshop_id);
CREATE INDEX idx_members_role ON workshop_members(role);
CREATE INDEX idx_members_email ON workshop_members(email);

-- -----------------------------------------------------------------------------
-- 3. Customers (Vehicle Owners / Fleet Accounts)
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    customer_type VARCHAR(30) NOT NULL DEFAULT 'Individual' CHECK (customer_type IN ('Individual', 'Fleet', 'VIP', 'Commercial')),
    status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Due Soon', 'Overdue', 'Inactive')),
    marketing_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    visit_count INTEGER NOT NULL DEFAULT 0,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(workshop_id, phone)
);

CREATE INDEX idx_customers_workshop ON customers(workshop_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_archived ON customers(archived_at);

-- -----------------------------------------------------------------------------
-- 4. Vehicles (Multi-Vehicle per Customer)
-- -----------------------------------------------------------------------------
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plate_number VARCHAR(30) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(80) NOT NULL,
    year INTEGER NOT NULL CHECK (year BETWEEN 1980 AND 2030),
    vin VARCHAR(50),
    engine_capacity VARCHAR(20),
    fuel_type VARCHAR(20) NOT NULL DEFAULT 'Petrol' CHECK (fuel_type IN ('Petrol', 'Diesel', 'Hybrid', 'EV')),
    transmission VARCHAR(20) NOT NULL DEFAULT 'Automatic' CHECK (transmission IN ('Automatic', 'Manual', 'CVT', 'DCT')),
    current_mileage INTEGER NOT NULL DEFAULT 0 CHECK (current_mileage >= 0),
    daily_mileage_rate INTEGER NOT NULL DEFAULT 40 CHECK (daily_mileage_rate >= 0),
    oil_type VARCHAR(50) NOT NULL DEFAULT 'Full Synthetic 5W-30',
    last_service_date TIMESTAMP WITH TIME ZONE,
    last_service_mileage INTEGER NOT NULL DEFAULT 0 CHECK (last_service_mileage >= 0),
    next_service_due_date TIMESTAMP WITH TIME ZONE,
    next_service_due_mileage INTEGER NOT NULL DEFAULT 5000 CHECK (next_service_due_mileage >= 0),
    maintenance_status VARCHAR(30) NOT NULL DEFAULT 'On Track' CHECK (maintenance_status IN ('On Track', 'Due Soon', 'Overdue')),
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(workshop_id, plate_number)
);

CREATE INDEX idx_vehicles_workshop ON vehicles(workshop_id);
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_maint_status ON vehicles(maintenance_status);
CREATE INDEX idx_vehicles_next_service ON vehicles(next_service_due_date);

-- -----------------------------------------------------------------------------
-- 5. Appointments (Booking Schedule)
-- -----------------------------------------------------------------------------
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    assigned_bay VARCHAR(50),
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 60,
    customer_notes TEXT,
    internal_notes TEXT,
    created_by UUID REFERENCES workshop_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_workshop ON appointments(workshop_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_vehicle ON appointments(vehicle_id);

-- -----------------------------------------------------------------------------
-- 6. Service Jobs (Work Orders & Bay Lifecycle)
-- -----------------------------------------------------------------------------
CREATE TABLE service_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES workshop_members(id) ON DELETE SET NULL,
    service_bay VARCHAR(50) NOT NULL DEFAULT 'Bay 1',
    stage VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (stage IN (
        'draft',
        'pending_inspection',
        'in_progress',
        'waiting_parts',
        'ready_for_pickup',
        'completed',
        'invoiced',
        'cancelled'
    )),
    service_type VARCHAR(120) NOT NULL,
    odometer_reading INTEGER NOT NULL CHECK (odometer_reading >= 0),
    symptoms_reported TEXT,
    diagnosis TEXT,
    technician_notes TEXT,
    parts_list JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {name, part_no, qty, unit_price, total}
    labor_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    parts_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_jobs_workshop ON service_jobs(workshop_id);
CREATE INDEX idx_service_jobs_stage ON service_jobs(stage);
CREATE INDEX idx_service_jobs_customer ON service_jobs(customer_id);
CREATE INDEX idx_service_jobs_vehicle ON service_jobs(vehicle_id);
CREATE INDEX idx_service_jobs_created ON service_jobs(created_at DESC);

-- -----------------------------------------------------------------------------
-- 7. Mileage Logs (Odometer Progression Audit)
-- -----------------------------------------------------------------------------
CREATE TABLE mileage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    mileage INTEGER NOT NULL CHECK (mileage >= 0),
    recorded_by UUID REFERENCES workshop_members(id) ON DELETE SET NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'workshop_inspection' CHECK (source IN (
        'workshop_inspection',
        'service_job',
        'whatsapp_inquiry',
        'customer_portal',
        'manual_entry'
    )),
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mileage_logs_workshop ON mileage_logs(workshop_id);
CREATE INDEX idx_mileage_logs_vehicle ON mileage_logs(vehicle_id);
CREATE INDEX idx_mileage_logs_recorded ON mileage_logs(recorded_at DESC);

-- -----------------------------------------------------------------------------
-- 8. Inquiries & Leads (Inbound Queue & NLP Extraction)
-- -----------------------------------------------------------------------------
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    channel VARCHAR(30) NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'phone', 'walk_in', 'web', 'email')),
    sender_name VARCHAR(120),
    sender_phone VARCHAR(50) NOT NULL,
    raw_message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'converted', 'rejected')),
    
    -- NLP Extracted Structured Entities
    extracted_data JSONB NOT NULL DEFAULT '{
        "customer_name": null,
        "phone": null,
        "plate_number": null,
        "make": null,
        "model": null,
        "year": null,
        "symptoms": [],
        "requested_service": null,
        "preferred_date": null,
        "preferred_time": null,
        "urgency": "normal"
    }'::jsonb,
    extraction_confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.000 CHECK (extraction_confidence BETWEEN 0 AND 1),
    extraction_provider VARCHAR(50) NOT NULL DEFAULT 'rules_fallback', -- 'gemini-2.5-flash', 'rules_fallback'
    
    -- Conversion Audit
    converted_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    converted_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    converted_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES workshop_members(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    staff_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiries_workshop ON inquiries(workshop_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);

-- -----------------------------------------------------------------------------
-- 9. Communication Logs (WhatsApp & System Messages)
-- -----------------------------------------------------------------------------
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
    channel VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    recipient_phone VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'simulated' CHECK (status IN ('simulated', 'queued', 'sent', 'delivered', 'read', 'failed')),
    provider VARCHAR(50) NOT NULL DEFAULT 'demo_adapter', -- 'official_whatsapp_cloud_api', 'demo_adapter'
    external_message_id VARCHAR(100),
    meta_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comm_logs_workshop ON communication_logs(workshop_id);
CREATE INDEX idx_comm_logs_customer ON communication_logs(customer_id);
CREATE INDEX idx_comm_logs_created ON communication_logs(created_at DESC);

-- -----------------------------------------------------------------------------
-- 10. Service Reminders (Upcoming, Due & Overdue Intervals)
-- -----------------------------------------------------------------------------
CREATE TABLE service_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('oil_change', 'synthetic_oil', 'brake_service', 'major_service', 'general_inspection')),
    due_date TIMESTAMP WITH TIME ZONE,
    due_mileage INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due', 'overdue', 'dismissed', 'scheduled', 'completed')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    last_sent_at TIMESTAMP WITH TIME ZONE,
    send_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(workshop_id, vehicle_id, reminder_type, status)
);

CREATE INDEX idx_reminders_workshop ON service_reminders(workshop_id);
CREATE INDEX idx_reminders_status ON service_reminders(status);
CREATE INDEX idx_reminders_vehicle ON service_reminders(vehicle_id);

-- -----------------------------------------------------------------------------
-- 11. AI Recommendations (Workshop Operations & Retention Advice)
-- -----------------------------------------------------------------------------
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('retention', 'maintenance_upsell', 'inventory_demand', 'service_scheduling', 'pricing')),
    title VARCHAR(200) NOT NULL,
    recommendation TEXT NOT NULL,
    supporting_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 0.850 CHECK (confidence_score BETWEEN 0 AND 1),
    provider VARCHAR(50) NOT NULL DEFAULT 'rules_fallback', -- 'gemini-2.5-flash', 'rules_fallback'
    status VARCHAR(30) NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'dismissed', 'executed')),
    action_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_recs_workshop ON ai_recommendations(workshop_id);
CREATE INDEX idx_ai_recs_status ON ai_recommendations(status);

-- -----------------------------------------------------------------------------
-- 12. Activity Logs (Workshop Operations Audit Trail)
-- -----------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES workshop_members(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    description TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_workshop ON activity_logs(workshop_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

-- =============================================================================
-- Triggers for Automatic updated_at Timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_workshops_updated BEFORE UPDATE ON workshops FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_workshop_members_updated BEFORE UPDATE ON workshop_members FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_service_jobs_updated BEFORE UPDATE ON service_jobs FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_inquiries_updated BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_service_reminders_updated BEFORE UPDATE ON service_reminders FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_ai_recommendations_updated BEFORE UPDATE ON ai_recommendations FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- =============================================================================
-- Row Level Security (RLS) Configuration
-- =============================================================================
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Permissive workspace policies (Scoped to authenticated users / service role)
CREATE POLICY "Allow authenticated read workshops" ON workshops FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update workshops" ON workshops FOR ALL USING (true);

CREATE POLICY "Allow access workshop_members" ON workshop_members FOR ALL USING (true);
CREATE POLICY "Allow access customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow access vehicles" ON vehicles FOR ALL USING (true);
CREATE POLICY "Allow access appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow access service_jobs" ON service_jobs FOR ALL USING (true);
CREATE POLICY "Allow access mileage_logs" ON mileage_logs FOR ALL USING (true);
CREATE POLICY "Allow access inquiries" ON inquiries FOR ALL USING (true);
CREATE POLICY "Allow access communication_logs" ON communication_logs FOR ALL USING (true);
CREATE POLICY "Allow access service_reminders" ON service_reminders FOR ALL USING (true);
CREATE POLICY "Allow access ai_recommendations" ON ai_recommendations FOR ALL USING (true);
CREATE POLICY "Allow access activity_logs" ON activity_logs FOR ALL USING (true);

-- Enable Realtime publication for dynamic updates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE customers, vehicles, appointments, service_jobs, inquiries, service_reminders;
    END IF;
END $$;

-- =============================================================================
-- Seed Data: Real-World Malaysian Automotive Workshop Setup
-- =============================================================================
DO $$
DECLARE
    ws_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
    admin_id UUID := '22222222-2222-2222-2222-222222222222'::uuid;
    pic_id UUID := '33333333-3333-3333-3333-333333333333'::uuid;
    tech_id UUID := '44444444-4444-4444-4444-444444444444'::uuid;

    cust1 UUID := 'c1111111-1111-1111-1111-111111111111'::uuid;
    cust2 UUID := 'c2222222-2222-2222-2222-222222222222'::uuid;
    cust3 UUID := 'c3333333-3333-3333-3333-333333333333'::uuid;
    cust4 UUID := 'c4444444-4444-4444-4444-444444444444'::uuid;
    cust5 UUID := 'c5555555-5555-5555-5555-555555555555'::uuid;

    veh1 UUID := 'v1111111-1111-1111-1111-111111111111'::uuid;
    veh2 UUID := 'v2222222-2222-2222-2222-222222222222'::uuid;
    veh3 UUID := 'v3333333-3333-3333-3333-333333333333'::uuid;
    veh4 UUID := 'v4444444-4444-4444-4444-444444444444'::uuid;
    veh5 UUID := 'v5555555-5555-5555-5555-555555555555'::uuid;
    veh6 UUID := 'v6666666-6666-6666-6666-666666666666'::uuid;

    apt1 UUID := gen_random_uuid();
    apt2 UUID := gen_random_uuid();
    apt3 UUID := gen_random_uuid();
BEGIN
    -- 1. Create Main Workshop
    INSERT INTO workshops (id, name, registration_no, phone, email, address, currency, currency_symbol, timezone)
    VALUES (
        ws_id,
        'Apex AutoWorks & Diagnostic Centre',
        'SSM-2026-088192-A',
        '+60 12-456 7890',
        'contact@apexautoworks.com.my',
        'No. 18, Jalan Industri Bayan Lepas, 11900 Bayan Lepas, Penang, Malaysia',
        'MYR',
        'RM',
        'Asia/Kuala_Lumpur'
    );

    -- 2. Create Members / Staff
    INSERT INTO workshop_members (id, workshop_id, email, full_name, role, phone)
    VALUES 
        (admin_id, ws_id, 'admin@apexautoworks.com.my', 'Airiel Hazim (Workshop Owner)', 'owner', '+60 12-456 7890'),
        (pic_id, ws_id, 'pic@apexautoworks.com.my', 'Sarah Tan (PIC / Service Advisor)', 'pic', '+60 16-889 2311'),
        (tech_id, ws_id, 'tech@apexautoworks.com.my', 'Hakim Danial (Lead Diagnostic Technician)', 'technician', '+60 11-234 5678');

    -- 3. Customers
    INSERT INTO customers (id, workshop_id, full_name, phone, email, address, customer_type, status, total_spent, visit_count, tags, notes)
    VALUES 
        (cust1, ws_id, 'Ahmad Razali', '+60 12-345 6789', 'ahmad.razali@gmail.com', 'Taman Sri Nibong, Bayan Lepas, Penang', 'Individual', 'Overdue', 1450.00, 3, '["Commuter", "Daily Driver"]'::jsonb, 'Prefers early morning drop-offs.'),
        (cust2, ws_id, 'Tan Wei Ming', '+60 17-882 1902', 'weiming.tan@outlook.com', 'Greenlane Heights, Georgetown, Penang', 'Individual', 'Active', 3820.00, 5, '["Enthusiast", "Synthetic Preferred"]'::jsonb, 'Sensitive to wheel alignment issues.'),
        (cust3, ws_id, 'Priya Subramaniam', '+60 16-554 2190', 'priya.subra@yahoo.com', 'Pulau Tikus, Penang', 'Individual', 'Due Soon', 2190.00, 4, '["SUV", "Family Car"]'::jsonb, 'Requested reminder via WhatsApp prior to visits.'),
        (cust4, ws_id, 'Michael Wong (Apex Logistics)', '+60 19-411 9832', 'mwong@apexlogistics.my', 'Gelugor, Penang', 'Fleet', 'Active', 7600.00, 8, '["Commercial Fleet", "Priority Account"]'::jsonb, 'Fleet manager - handles 2 Toyota commercial vans.'),
        (cust5, ws_id, 'Nurul Huda', '+60 11-399 4410', 'nurul.huda@gmail.com', 'Relau, Bayan Lepas, Penang', 'Individual', 'Overdue', 980.00, 2, '["Budget Minded", "At Risk"]'::jsonb, 'Follow up gently on 40k major service quote.');

    -- 4. Vehicles (Including 2 vehicles for Fleet customer Michael Wong)
    INSERT INTO vehicles (id, workshop_id, customer_id, plate_number, make, model, year, vin, current_mileage, daily_mileage_rate, oil_type, last_service_date, last_service_mileage, next_service_due_date, next_service_due_mileage, maintenance_status)
    VALUES 
        (veh1, ws_id, cust1, 'WXY 8821', 'Perodua', 'Myvi 1.5 AV', 2021, 'PM2M800K1234901', 58400, 45, 'Semi-Synthetic 10W-40', NOW() - INTERVAL '210 days', 50000, NOW() - INTERVAL '30 days', 55000, 'Overdue'),
        (veh2, ws_id, cust2, 'PNG 4419', 'Honda', 'Civic RS 1.5 VTEC Turbo', 2022, 'JHMFK7H89012345', 38200, 35, 'Full Synthetic 5W-30', NOW() - INTERVAL '45 days', 35000, NOW() + INTERVAL '135 days', 45000, 'On Track'),
        (veh3, ws_id, cust3, 'VAB 2020', 'Proton', 'X50 1.5 TGDi Flagship', 2021, 'PL1TG50K7891234', 41800, 40, 'Full Synthetic 0W-20', NOW() - INTERVAL '150 days', 35000, NOW() + INTERVAL '10 days', 42000, 'Due Soon'),
        (veh4, ws_id, cust4, 'JRS 7731', 'Toyota', 'HiAce Panel Van 2.5 Turbo Diesel', 2020, 'MR2NSP151234567', 92000, 75, 'Diesel Engine Oil 15W-40', NOW() - INTERVAL '20 days', 90000, NOW() + INTERVAL '70 days', 95000, 'On Track'),
        (veh5, ws_id, cust4, 'KV 5502', 'Toyota', 'Vios 1.5G Dual VVT-i', 2021, 'MR2NSP159876543', 64500, 50, 'Full Synthetic 5W-30', NOW() - INTERVAL '60 days', 60000, NOW() + INTERVAL '120 days', 70000, 'On Track'),
        (veh6, ws_id, cust5, 'PKR 3190', 'Perodua', 'Bezza 1.3X', 2020, 'PM2M810B3344556', 44800, 30, 'Semi-Synthetic 10W-40', NOW() - INTERVAL '230 days', 35000, NOW() - INTERVAL '50 days', 40000, 'Overdue');

    -- 5. Appointments
    INSERT INTO appointments (id, workshop_id, customer_id, vehicle_id, scheduled_at, service_type, status, assigned_bay, customer_notes, created_by)
    VALUES 
        (apt1, ws_id, cust3, veh3, NOW() + INTERVAL '2 hours', 'Brake Pad & Rotor Inspection', 'in_progress', 'Bay 2 (Brakes)', 'Customer reports high-pitched squeak when braking downhill.', pic_id),
        (apt2, ws_id, cust2, veh2, NOW() + INTERVAL '1 day 3 hours', 'Routine 40k Major Synthetic Service', 'scheduled', 'Bay 1 (Engine)', 'Scheduled regular service interval.', pic_id),
        (apt3, ws_id, cust4, veh4, NOW() + INTERVAL '3 days 4 hours', 'Fleet Suspension & Bushing Check', 'confirmed', 'Bay 3 (General)', 'Commercial van maintenance routine.', admin_id);

    -- 6. Service Jobs (Work Orders)
    INSERT INTO service_jobs (workshop_id, appointment_id, customer_id, vehicle_id, technician_id, service_bay, stage, service_type, odometer_reading, symptoms_reported, diagnosis, parts_list, labor_cost, parts_cost, total_amount, payment_status, started_at)
    VALUES 
        (ws_id, apt1, cust3, veh3, tech_id, 'Bay 2 (Brakes)', 'in_progress', 'Brake Pad & Rotor Inspection', 41800, 'High-pitched squeak when braking downhill near Penang Bridge.', 'Front brake pads worn down to 2.5mm. Rotors require skimming.', '[{"name":"Brembo Front Ceramic Brake Pads","part_no":"BR-P500","qty":1,"unit_price":220.00,"total":220.00},{"name":"Precision Rotor Skimming (Pair)","part_no":"LAB-SKIM","qty":2,"unit_price":60.00,"total":120.00}]'::jsonb, 100.00, 340.00, 440.00, 'pending', NOW() - INTERVAL '45 minutes'),
        (ws_id, NULL, cust1, veh1, tech_id, 'Bay 1 (Engine)', 'pending_inspection', 'Overdue 50k Major Engine Service', 58400, 'Engine idling roughly; yellow check engine light briefly appeared.', 'Awaiting OBD-II diagnostic scan. Overdue 8,400km past maintenance threshold.', '[]'::jsonb, 120.00, 0.00, 120.00, 'pending', NULL),
        (ws_id, NULL, cust4, veh5, tech_id, 'Bay 4 (QC)', 'ready_for_pickup', 'Air Conditioning Flush & Carbon Filter', 64500, 'Cabin blower weak and warm at midday.', 'Cabin pollen filter clogged and refrigerant low. Vacuum tested no leaks.', '[{"name":"Denso Carbon Cabin Filter","part_no":"DEN-CF01","qty":1,"unit_price":55.00,"total":55.00},{"name":"R134a AC Gas Flush & Re-gas","part_no":"GAS-R134","qty":1,"unit_price":85.00,"total":85.00}]'::jsonb, 70.00, 140.00, 210.00, 'paid', NOW() - INTERVAL '3 hours');

    -- 7. Mileage Logs
    INSERT INTO mileage_logs (workshop_id, vehicle_id, mileage, recorded_by, source, notes)
    VALUES 
        (ws_id, veh3, 41800, tech_id, 'service_job', 'Intake odometer verified on service entry.'),
        (ws_id, veh1, 58400, pic_id, 'manual_entry', 'Customer stated mileage during phone booking.'),
        (ws_id, veh5, 64500, tech_id, 'workshop_inspection', 'Routine service intake verification.');

    -- 8. Inquiries & Leads (With Structured NLP Extraction & Confidence)
    INSERT INTO inquiries (workshop_id, channel, sender_name, sender_phone, raw_message, status, extracted_data, extraction_confidence, extraction_provider)
    VALUES 
        (
            ws_id,
            'whatsapp',
            'Priya Subramaniam',
            '+60 16-554 2190',
            'Salam Sarah, my Proton X50 plate VAB 2020 has high pitched squeak when I step on the brakes. Can I drop by tomorrow at 2:30pm?',
            'reviewed',
            '{
                "customer_name": "Priya Subramaniam",
                "phone": "+60 16-554 2190",
                "plate_number": "VAB 2020",
                "make": "Proton",
                "model": "X50",
                "year": 2021,
                "symptoms": ["high pitched squeak when braking"],
                "requested_service": "Brake Pad & Rotor Inspection",
                "preferred_date": "Tomorrow",
                "preferred_time": "2:30 PM",
                "urgency": "high"
            }'::jsonb,
            0.940,
            'gemini-2.5-flash'
        ),
        (
            ws_id,
            'whatsapp',
            'Ahmad Razali',
            '+60 12-345 6789',
            'Hi boss, my Myvi WXY 8821 engine vibrating heavily and yellow light came out on dashboard. How much to check?',
            'reviewed',
            '{
                "customer_name": "Ahmad Razali",
                "phone": "+60 12-345 6789",
                "plate_number": "WXY 8821",
                "make": "Perodua",
                "model": "Myvi",
                "year": null,
                "symptoms": ["engine vibrating heavily", "check engine light on dashboard"],
                "requested_service": "Diagnostic Scan & Inspection",
                "preferred_date": null,
                "preferred_time": null,
                "urgency": "urgent"
            }'::jsonb,
            0.910,
            'gemini-2.5-flash'
        ),
        (
            ws_id,
            'whatsapp',
            'Kenny Ooi',
            '+60 12-771 9900',
            'Hi, looking to service my Honda City GN2. Mileage around 30,000 km. What is the package price for full synthetic?',
            'new',
            '{
                "customer_name": "Kenny Ooi",
                "phone": "+60 12-771 9900",
                "plate_number": null,
                "make": "Honda",
                "model": "City GN2",
                "year": null,
                "symptoms": [],
                "requested_service": "30,000 km Full Synthetic Service",
                "preferred_date": null,
                "preferred_time": null,
                "urgency": "normal"
            }'::jsonb,
            0.880,
            'rules_fallback'
        );

    -- 9. Communication Logs (Simulated WhatsApp Outbox)
    INSERT INTO communication_logs (workshop_id, customer_id, channel, direction, recipient_phone, message_content, status, provider)
    VALUES 
        (
            ws_id,
            cust3,
            'whatsapp',
            'outbound',
            '+60 16-554 2190',
            'Hi Priya! Your Proton X50 (VAB 2020) appointment is confirmed for today at 2:30 PM in Bay 2 for front brake inspection. See you shortly at Apex AutoWorks!',
            'simulated',
            'demo_adapter'
        ),
        (
            ws_id,
            cust1,
            'whatsapp',
            'outbound',
            '+60 12-345 6789',
            'Hi Ahmad! Your Myvi (WXY 8821) is overdue for its 50,000 km service. We recommend an urgent OBD-II scan to resolve engine vibration. Book today and receive RM30 off.',
            'simulated',
            'demo_adapter'
        );

    -- 10. Service Reminders
    INSERT INTO service_reminders (workshop_id, vehicle_id, customer_id, reminder_type, due_date, due_mileage, status, priority, notes)
    VALUES 
        (ws_id, veh1, cust1, 'oil_change', NOW() - INTERVAL '30 days', 55000, 'overdue', 'urgent', 'Vehicle 30 days and 3,400 km overdue for oil change.'),
        (ws_id, veh6, cust5, 'major_service', NOW() - INTERVAL '50 days', 40000, 'overdue', 'urgent', 'Major 40k service overdue - spark plugs and transmission fluid due.'),
        (ws_id, veh3, cust3, 'brake_service', NOW() + INTERVAL '10 days', 42000, 'due', 'high', 'Front and rear brake pad inspection interval approaching.'),
        (ws_id, veh4, cust4, 'synthetic_oil', NOW() + INTERVAL '70 days', 95000, 'upcoming', 'normal', 'Commercial fleet routine 95k maintenance interval.');

    -- 11. AI Recommendations (With Supporting Evidentiary Backing)
    INSERT INTO ai_recommendations (workshop_id, customer_id, vehicle_id, category, title, recommendation, supporting_evidence, confidence_score, provider, status)
    VALUES 
        (
            ws_id,
            cust1,
            veh1,
            'retention',
            'Urgent Service Recall: Ahmad Razali (Myvi WXY 8821)',
            'Reach out via WhatsApp with priority diagnostic booking. Offer RM30 discount on Liqui Moly synthetic service to prevent complete engine coil failure.',
            '[
                {"fact": "Odometer Overdue", "detail": "Current mileage 58,400km vs due 55,000km (3,400km overdue)"},
                {"fact": "Last Contact Gap", "detail": "Last recorded workshop visit was 210 days ago"},
                {"fact": "Reported Vibration", "detail": "Customer WhatsApp complaint indicates misfire or fouled spark plugs"}
            ]'::jsonb,
            0.920,
            'gemini-2.5-flash',
            'approved'
        ),
        (
            ws_id,
            cust4,
            veh4,
            'maintenance_upsell',
            'Commercial Fleet Preventive Transmission Fluid Flush',
            'Apex Logistics HiAce (JRS 7731) has reached 92,000km. Propose scheduled automatic transmission fluid and differential service during next week appointment.',
            '[
                {"fact": "Commercial Usage", "detail": "Daily rate 75km/day under heavy payload conditions"},
                {"fact": "Transmission Interval", "detail": "Manufacturer suggests transmission fluid replacement at 90k-100k km"}
            ]'::jsonb,
            0.870,
            'rules_fallback',
            'suggested'
        ),
        (
            ws_id,
            NULL,
            NULL,
            'inventory_demand',
            'Restock Alert: Liqui Moly 5W-30 & Perodua Brake Pads',
            'Forecasted demand indicates 18 synthetic oil changes and 6 brake jobs in the next 14 days. Current workshop inventory is below safety buffer.',
            '[
                {"fact": "Upcoming Due Count", "detail": "14 vehicles entering due window within next 2 weeks"},
                {"fact": "Current Stock", "detail": "Brembo Myvi pads: 2 sets remaining (reorder threshold 6 sets)"}
            ]'::jsonb,
            0.900,
            'rules_fallback',
            'suggested'
        );

    -- 12. Activity Logs
    INSERT INTO activity_logs (workshop_id, user_id, action, entity_type, entity_id, description, details)
    VALUES 
        (ws_id, pic_id, 'appointment.created', 'appointment', apt1, 'Created appointment for Priya Subramaniam (Proton X50 VAB 2020)', '{"service": "Brake Inspection", "bay": "Bay 2"}'::jsonb),
        (ws_id, tech_id, 'service_job.started', 'service_job', apt1, 'Technician Hakim started brake pad & rotor inspection in Bay 2', '{"odometer": 41800}'::jsonb),
        (ws_id, pic_id, 'inquiry.reviewed', 'inquiry', NULL, 'Staff reviewed inbound WhatsApp inquiry from Priya Subramaniam', '{"status": "reviewed"}'::jsonb);

END $$;
