-- =============================================================================
-- SmartCRM: Intelligent Automotive Workshop Customer Relationship Management
-- Supabase PostgreSQL Relational Schema with Row-Level Security (RLS)
-- CAT405 Intelligent Computing Major Project (Airiel Hazim Bin Redzuan Ng - USM)
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in dependency order if re-initializing
DROP TABLE IF EXISTS business_insights CASCADE;
DROP TABLE IF EXISTS predictive_scores CASCADE;
DROP TABLE IF EXISTS ai_campaigns CASCADE;
DROP TABLE IF EXISTS whatsapp_interactions CASCADE;
DROP TABLE IF EXISTS service_records CASCADE;
DROP TABLE IF EXISTS mileage_logs CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS workshop_users CASCADE;
DROP TABLE IF EXISTS workshop_profiles CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Workshop Profile (SME Automotive Workshop Info)
-- -----------------------------------------------------------------------------
CREATE TABLE workshop_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_name VARCHAR(150) NOT NULL DEFAULT 'Apex AutoWorks & Diagnostic Centre',
    registration_no VARCHAR(50) DEFAULT 'SSM-2026-088192-A',
    pic_name VARCHAR(120) NOT NULL DEFAULT 'Airiel Hazim Bin Redzuan Ng',
    phone VARCHAR(50) NOT NULL DEFAULT '+60 12-456 7890',
    email VARCHAR(255) NOT NULL DEFAULT 'contact@apexautoworks.com.my',
    address TEXT NOT NULL DEFAULT 'No. 18, Jalan Industri Bayan Lepas, 11900 Bayan Lepas, Penang, Malaysia',
    currency VARCHAR(10) NOT NULL DEFAULT 'MYR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. Workshop Users & Staff (Owners, PICs, Technicians)
-- -----------------------------------------------------------------------------
CREATE TABLE workshop_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'pic', -- 'admin', 'pic' (Person-in-Charge), 'technician'
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workshop_users_email ON workshop_users(email);
CREATE INDEX idx_workshop_users_role ON workshop_users(role);

-- -----------------------------------------------------------------------------
-- 3. Customers (Vehicle Owners / Fleet Accounts)
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL, -- Primary key for WhatsApp integration
    email VARCHAR(255) UNIQUE,
    address TEXT,
    customer_type VARCHAR(30) NOT NULL DEFAULT 'Individual', -- 'Individual', 'Fleet', 'VIP'
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Due Soon', 'Overdue', 'Churned'
    health_score INTEGER NOT NULL DEFAULT 85 CHECK (health_score BETWEEN 0 AND 100),
    churn_risk VARCHAR(20) NOT NULL DEFAULT 'Low', -- 'Low', 'Medium', 'High'
    sentiment VARCHAR(20) NOT NULL DEFAULT 'Positive', -- 'Positive', 'Neutral', 'Negative'
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    visit_count INTEGER NOT NULL DEFAULT 1,
    tags JSONB NOT NULL DEFAULT '["Repeat Customer"]'::jsonb,
    notes TEXT,
    last_visit_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_health ON customers(health_score);
CREATE INDEX idx_customers_churn ON customers(churn_risk);

-- -----------------------------------------------------------------------------
-- 4. Vehicles (Multi-Vehicle Linking per Customer)
-- -----------------------------------------------------------------------------
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plate_number VARCHAR(30) UNIQUE NOT NULL, -- e.g., 'PNG 4419', 'WXY 8821'
    make VARCHAR(50) NOT NULL, -- e.g., 'Honda', 'Toyota', 'Proton', 'Perodua', 'BMW'
    model VARCHAR(80) NOT NULL, -- e.g., 'Civic RS 1.5 Turbo', 'Myvi 1.5 AV', 'X50 1.5 TGDi'
    year INTEGER NOT NULL CHECK (year BETWEEN 1990 AND 2030),
    vin VARCHAR(50),
    transmission VARCHAR(20) NOT NULL DEFAULT 'Automatic', -- 'Automatic', 'Manual', 'CVT', 'DCT'
    fuel_type VARCHAR(20) NOT NULL DEFAULT 'Petrol', -- 'Petrol', 'Diesel', 'Hybrid', 'EV'
    current_mileage INTEGER NOT NULL DEFAULT 0 CHECK (current_mileage >= 0),
    daily_mileage_rate INTEGER NOT NULL DEFAULT 40, -- Estimated km driven per day
    oil_type VARCHAR(50) NOT NULL DEFAULT 'Full Synthetic 5W-30',
    last_service_date TIMESTAMP WITH TIME ZONE,
    last_service_mileage INTEGER NOT NULL DEFAULT 0,
    next_service_due_date TIMESTAMP WITH TIME ZONE,
    next_service_due_mileage INTEGER NOT NULL DEFAULT 5000,
    maintenance_status VARCHAR(30) NOT NULL DEFAULT 'On Track', -- 'On Track', 'Due Soon', 'Overdue'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_maint_status ON vehicles(maintenance_status);
CREATE INDEX idx_vehicles_next_service ON vehicles(next_service_due_date);

-- -----------------------------------------------------------------------------
-- 5. Mileage Logs (Tracking Odometer Progression for Predictive Reminders)
-- -----------------------------------------------------------------------------
CREATE TABLE mileage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    mileage INTEGER NOT NULL CHECK (mileage >= 0),
    recorded_by UUID REFERENCES workshop_users(id) ON DELETE SET NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'Workshop Inspection', -- 'Workshop Inspection', 'WhatsApp Intake', 'Service Entry'
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mileage_logs_vehicle ON mileage_logs(vehicle_id);
CREATE INDEX idx_mileage_logs_recorded ON mileage_logs(recorded_at DESC);

-- -----------------------------------------------------------------------------
-- 6. Service Records & Work Orders (Kanban Workflow)
-- -----------------------------------------------------------------------------
CREATE TABLE service_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES workshop_users(id) ON DELETE SET NULL,
    service_type VARCHAR(100) NOT NULL, -- 'Standard Engine Oil Service', 'Brake Pad & Rotor Replacement', 'Major 40k Service', 'AC Overhaul'
    odometer_reading INTEGER NOT NULL CHECK (odometer_reading >= 0),
    service_bay VARCHAR(30) DEFAULT 'Bay 1', -- 'Bay 1 (Engine)', 'Bay 2 (Brakes/Suspension)', 'Bay 3 (General)', 'Bay 4 (QC)'
    stage VARCHAR(50) NOT NULL DEFAULT 'Scheduled', -- 'Inquiry', 'Scheduled', 'In Progress', 'Quality Inspection', 'Ready for Pickup', 'Completed', 'Invoiced'
    symptoms_reported TEXT,
    diagnosis TEXT,
    parts_list JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of [{ name, part_no, qty, unit_price }]
    labor_cost NUMERIC(10, 2) NOT NULL DEFAULT 80.00,
    parts_cost NUMERIC(10, 2) NOT NULL DEFAULT 160.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 240.00,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Paid', 'Partial'
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    technician_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_customer ON service_records(customer_id);
CREATE INDEX idx_services_vehicle ON service_records(vehicle_id);
CREATE INDEX idx_services_stage ON service_records(stage);
CREATE INDEX idx_services_scheduled ON service_records(scheduled_date);

-- -----------------------------------------------------------------------------
-- 7. WhatsApp Interactions & NLP Chat Logs
-- -----------------------------------------------------------------------------
CREATE TABLE whatsapp_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    phone VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL DEFAULT 'Inbound', -- 'Inbound', 'Outbound'
    raw_message TEXT NOT NULL,
    nlp_extracted_intent VARCHAR(100), -- 'Service Booking', 'Price Quote', 'Symptom Consultation', 'Appointment Reschedule'
    nlp_extracted_symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    nlp_extracted_plate VARCHAR(30),
    sentiment_score NUMERIC(4, 3) NOT NULL DEFAULT 0.000, -- -1.000 to +1.000
    urgency VARCHAR(20) NOT NULL DEFAULT 'Normal', -- 'Normal', 'High', 'Urgent'
    auto_reply_sent TEXT,
    booking_id UUID REFERENCES service_records(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_phone ON whatsapp_interactions(phone);
CREATE INDEX idx_whatsapp_customer ON whatsapp_interactions(customer_id);
CREATE INDEX idx_whatsapp_created ON whatsapp_interactions(created_at DESC);

-- -----------------------------------------------------------------------------
-- 8. Proactive AI Marketing Campaigns
-- -----------------------------------------------------------------------------
CREATE TABLE ai_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    target_segment VARCHAR(100) NOT NULL, -- 'Vehicles > 5 Years', 'Due for Oil Change', 'High Mileage > 80k', 'Lapsed > 180 Days'
    service_type VARCHAR(100) NOT NULL,
    promo_code VARCHAR(30) NOT NULL,
    discount_pct INTEGER NOT NULL DEFAULT 15,
    message_template TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active', -- 'Draft', 'Active', 'Completed'
    audience_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    conversion_count INTEGER NOT NULL DEFAULT 0,
    revenue_generated NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON ai_campaigns(status);

-- -----------------------------------------------------------------------------
-- 9. Predictive AI Scores & Retention Audits
-- -----------------------------------------------------------------------------
CREATE TABLE predictive_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    churn_probability NUMERIC(4, 3) NOT NULL DEFAULT 0.150,
    lead_score NUMERIC(5, 2) NOT NULL DEFAULT 75.00,
    retention_risk_level VARCHAR(20) NOT NULL DEFAULT 'Low', -- 'Low', 'Medium', 'High'
    days_overdue INTEGER NOT NULL DEFAULT 0,
    km_overdue INTEGER NOT NULL DEFAULT 0,
    risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    model_version VARCHAR(50) NOT NULL DEFAULT 'v2.0-automotive-rf',
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictive_customer ON predictive_scores(customer_id);
CREATE INDEX idx_predictive_vehicle ON predictive_scores(vehicle_id);

-- -----------------------------------------------------------------------------
-- 10. AI Business Strategist Insights & Prescriptive Analytics
-- -----------------------------------------------------------------------------
CREATE TABLE business_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL DEFAULT 'Monthly Workshop Health',
    repeat_service_rate NUMERIC(5, 2) NOT NULL DEFAULT 74.20,
    monthly_revenue NUMERIC(12, 2) NOT NULL DEFAULT 48250.00,
    active_fleet_count INTEGER NOT NULL DEFAULT 142,
    overdue_vehicle_count INTEGER NOT NULL DEFAULT 18,
    demand_forecast JSONB NOT NULL DEFAULT '{}'::jsonb,
    parts_inventory_alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
    pricing_recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    high_churn_accounts JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Triggers for Automatic updated_at Timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_service_records_updated BEFORE UPDATE ON service_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_ai_campaigns_updated BEFORE UPDATE ON ai_campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================================================
-- Row Level Security (RLS) Configuration for Supabase
-- =============================================================================
ALTER TABLE workshop_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_insights ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated workshop staff & service role
CREATE POLICY "Allow authenticated read on workshop_profiles" ON workshop_profiles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated modify on workshop_profiles" ON workshop_profiles FOR ALL USING (true);

CREATE POLICY "Allow full access on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow full access on vehicles" ON vehicles FOR ALL USING (true);
CREATE POLICY "Allow full access on mileage_logs" ON mileage_logs FOR ALL USING (true);
CREATE POLICY "Allow full access on service_records" ON service_records FOR ALL USING (true);
CREATE POLICY "Allow full access on whatsapp_interactions" ON whatsapp_interactions FOR ALL USING (true);
CREATE POLICY "Allow full access on ai_campaigns" ON ai_campaigns FOR ALL USING (true);
CREATE POLICY "Allow full access on predictive_scores" ON predictive_scores FOR ALL USING (true);
CREATE POLICY "Allow full access on business_insights" ON business_insights FOR ALL USING (true);

-- Enable Realtime publication for live shop-floor sync in Supabase
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE customers, vehicles, service_records, whatsapp_interactions;
    END IF;
END $$;

-- =============================================================================
-- Initial Realistic Seed Data for Malaysian Automotive Workshop Context
-- =============================================================================
-- 1. Workshop Profile
INSERT INTO workshop_profiles (workshop_name, pic_name, phone, email, address)
VALUES (
    'Apex AutoWorks & Diagnostic Centre',
    'Airiel Hazim Bin Redzuan Ng',
    '+60 12-456 7890',
    'pic@apexautoworks.com.my',
    'No. 18, Jalan Industri Bayan Lepas, 11900 Bayan Lepas, Penang, Malaysia'
);

-- 2. Workshop Staff
INSERT INTO workshop_users (email, hashed_password, full_name, role, phone)
VALUES 
    ('airiel@smartcrm.my', '$2b$12$e80yqR9q1k9i601x02eS5.7xQ131bSjR5sZ0g1lK7k8xZk9n6mE7G', 'Airiel Hazim (Owner / PIC)', 'pic', '+60 12-456 7890'),
    ('nadhir@smartcrm.my', '$2b$12$e80yqR9q1k9i601x02eS5.7xQ131bSjR5sZ0g1lK7k8xZk9n6mE7G', 'Dr. Mohd Nadhir (Chief Advisor)', 'admin', '+60 19-332 1109'),
    ('hakim@smartcrm.my', '$2b$12$e80yqR9q1k9i601x02eS5.7xQ131bSjR5sZ0g1lK7k8xZk9n6mE7G', 'Hakim Danial (Lead Diagnostic Technician)', 'technician', '+60 11-234 5678');

-- 3. Customers & Vehicles Seed
DO $$
DECLARE
    cust1_id UUID := gen_random_uuid();
    cust2_id UUID := gen_random_uuid();
    cust3_id UUID := gen_random_uuid();
    cust4_id UUID := gen_random_uuid();
    cust5_id UUID := gen_random_uuid();
    cust6_id UUID := gen_random_uuid();
    
    veh1_id UUID := gen_random_uuid();
    veh2_id UUID := gen_random_uuid();
    veh3_id UUID := gen_random_uuid();
    veh4_id UUID := gen_random_uuid();
    veh5_id UUID := gen_random_uuid();
    veh6_id UUID := gen_random_uuid();
BEGIN
    -- Customer 1: Ahmad Razali (Overdue Engine Oil & Filter)
    INSERT INTO customers (id, full_name, phone, email, address, status, health_score, churn_risk, sentiment, total_spent, visit_count, tags, last_visit_at)
    VALUES (cust1_id, 'Ahmad Razali', '+60 12-345 6789', 'ahmad.razali@gmail.com', 'Taman Sri Nibong, Bayan Lepas, Penang', 'Overdue', 38, 'High', 'Negative', 1450.00, 3, '["Sedan Owner", "Commuter", "At Risk"]'::jsonb, NOW() - INTERVAL '210 days');

    INSERT INTO vehicles (id, customer_id, plate_number, make, model, year, vin, current_mileage, last_service_date, last_service_mileage, next_service_due_date, next_service_due_mileage, maintenance_status)
    VALUES (veh1_id, cust1_id, 'WXY 8821', 'Perodua', 'Myvi 1.5 AV', 2021, 'PM2M800K1234901', 58400, NOW() - INTERVAL '210 days', 50000, NOW() - INTERVAL '30 days', 55000, 'Overdue');

    -- Customer 2: Tan Wei Ming (Active Regular Customer - Honda Civic)
    INSERT INTO customers (id, full_name, phone, email, address, status, health_score, churn_risk, sentiment, total_spent, visit_count, tags, last_visit_at)
    VALUES (cust2_id, 'Tan Wei Ming', '+60 17-882 1902', 'weiming.tan@outlook.com', 'Greenlane Heights, Georgetown, Penang', 'Active', 92, 'Low', 'Positive', 3820.00, 5, '["Enthusiast", "High Value", "Synthetic Preferred"]'::jsonb, NOW() - INTERVAL '45 days');

    INSERT INTO vehicles (id, customer_id, plate_number, make, model, year, vin, current_mileage, last_service_date, last_service_mileage, next_service_due_date, next_service_due_mileage, maintenance_status)
    VALUES (veh2_id, cust2_id, 'PNG 4419', 'Honda', 'Civic RS 1.5 VTEC Turbo', 2022, 'JHMFK7H89012345', 38200, NOW() - INTERVAL '45 days', 35000, NOW() + INTERVAL '135 days', 45000, 'On Track');

    -- Customer 3: Priya Subramaniam (Due Soon for Brake Service - Proton X50)
    INSERT INTO customers (id, full_name, phone, email, address, status, health_score, churn_risk, sentiment, total_spent, visit_count, tags, last_visit_at)
    VALUES (cust3_id, 'Priya Subramaniam', '+60 16-554 2190', 'priya.subra@yahoo.com', 'Pulau Tikus, Penang', 'Due Soon', 76, 'Medium', 'Neutral', 2190.00, 4, '["SUV Owner", "Safety Focused"]'::jsonb, NOW() - INTERVAL '150 days');

    INSERT INTO vehicles (id, customer_id, plate_number, make, model, year, vin, current_mileage, last_service_date, last_service_mileage, next_service_due_date, next_service_due_mileage, maintenance_status)
    VALUES (veh3_id, cust3_id, 'VAB 2020', 'Proton', 'X50 1.5 TGDi Flagship', 2021, 'PL1TG50K7891234', 41800, NOW() - INTERVAL '150 days', 35000, NOW() + INTERVAL '10 days', 42000, 'Due Soon');

    -- Customer 4: Michael Wong (Fleet Owner - 2 Vehicles)
    INSERT INTO customers (id, full_name, phone, email, address, status, health_score, churn_risk, sentiment, total_spent, visit_count, tags, last_visit_at)
    VALUES (cust4_id, 'Michael Wong', '+60 19-411 9832', 'mwong@apexlogistics.my', 'Gelugor, Penang', 'Active', 88, 'Low', 'Positive', 7600.00, 8, '["Commercial Fleet", "VIP Client"]'::jsonb, NOW() - INTERVAL '20 days');

    INSERT INTO vehicles (id, customer_id, plate_number, make, model, year, vin, current_mileage, last_service_date, last_service_mileage, next_service_due_date, next_service_due_mileage, maintenance_status)
    VALUES (veh4_id, cust4_id, 'JRS 7731', 'Toyota', 'Vios 1.5G Dual VVT-i', 2020, 'MR2NSP151234567', 72000, NOW() - INTERVAL '20 days', 70000, NOW() + INTERVAL '70 days', 75000, 'On Track');

    -- Customer 5: Nurul Huda (Overdue 40k Major Service - Perodua Bezza)
    INSERT INTO customers (id, full_name, phone, email, address, status, health_score, churn_risk, sentiment, total_spent, visit_count, tags, last_visit_at)
    VALUES (cust5_id, 'Nurul Huda', '+60 11-399 4410', 'nurul.huda@gmail.com', 'Relau, Bayan Lepas, Penang', 'Overdue', 44, 'High', 'Negative', 980.00, 2, '["First Time Car Owner", "Budget Minded", "At Risk"]'::jsonb, NOW() - INTERVAL '230 days');

    INSERT INTO vehicles (id, customer_id, plate_number, make, model, year, vin, current_mileage, last_service_date, last_service_mileage, next_service_due_date, next_service_due_mileage, maintenance_status)
    VALUES (veh5_id, cust5_id, 'KV 5502', 'Perodua', 'Bezza 1.3X', 2020, 'PM2M810B3344556', 44500, NOW() - INTERVAL '230 days', 35000, NOW() - INTERVAL '50 days', 40000, 'Overdue');

    -- Customer 6: Farhan Azman (Luxury Continental - BMW 320i Sport)
    INSERT INTO customers (id, full_name, phone, email, address, status, health_score, churn_risk, sentiment, total_spent, visit_count, tags, last_visit_at)
    VALUES (cust6_id, 'Farhan Azman', '+60 12-990 1234', 'farhan.azman@corp.com', 'Tanjung Bungah, Penang', 'Active', 95, 'Low', 'Positive', 8450.00, 6, '["Continental", "VIP Client", "Brembo Upgrade"]'::jsonb, NOW() - INTERVAL '15 days');

    INSERT INTO vehicles (id, customer_id, plate_number, make, model, year, vin, current_mileage, last_service_date, last_service_mileage, next_service_due_date, next_service_due_mileage, maintenance_status)
    VALUES (veh6_id, cust6_id, 'BQP 9912', 'BMW', '320i M Sport (G20)', 2022, 'WBA5R11030FG9812', 32400, NOW() - INTERVAL '15 days', 30000, NOW() + INTERVAL '165 days', 40000, 'On Track');

    -- 4. Initial Service Records (Active Kanban Work Orders)
    INSERT INTO service_records (customer_id, vehicle_id, service_type, odometer_reading, service_bay, stage, symptoms_reported, diagnosis, parts_list, labor_cost, parts_cost, total_amount, payment_status, scheduled_date)
    VALUES 
        (cust3_id, veh3_id, 'Brake Pad & Rotor Inspection', 41800, 'Bay 2 (Brakes)', 'In Progress', 'Customer heard squeaking when braking downhill near Penang Bridge.', 'Front brake pads worn down to 2.5mm. Rotors require skimming.', '[{"name":"Brembo Ceramic Front Pads","qty":1,"unit_price":220},{"name":"Rotor Skimming Service","qty":2,"unit_price":60}]'::jsonb, 100.00, 340.00, 440.00, 'Pending', NOW()),
        (cust2_id, veh2_id, 'Full Synthetic Engine Oil Service', 38200, 'Bay 1 (Engine)', 'Scheduled', 'Routine 10k synthetic maintenance interval.', 'Drain old oil, change genuine Honda oil filter, multi-point 25 safety check.', '[{"name":"Liqui Moly 5W-30 Full Synthetic 4L","qty":1,"unit_price":230},{"name":"Genuine Honda Filter & Washer","qty":1,"unit_price":38}]'::jsonb, 60.00, 268.00, 328.00, 'Pending', NOW() + INTERVAL '1 day'),
        (cust4_id, veh4_id, 'Air Conditioning System Flush & Regas', 72000, 'Bay 3 (General)', 'Quality Inspection', 'Blower working but air is lukewarm during hot afternoons.', 'Cabin pollen filter clogged and R134a refrigerant low. Vacuum tested no leaks.', '[{"name":"R134a Refrigerant Re-gas","qty":1,"unit_price":85},{"name":"Denso Carbon Cabin Filter","qty":1,"unit_price":55}]'::jsonb, 70.00, 140.00, 210.00, 'Pending', NOW()),
        (cust1_id, veh1_id, 'Urgent 50k Major Service & Diagnostics', 58400, 'Bay 1 (Engine)', 'Inquiry', 'Check engine warning light triggered, engine idle rough.', 'Overdue 8,400km past maintenance threshold. Spark plugs and throttle body require cleaning.', '[]'::jsonb, 120.00, 280.00, 400.00, 'Pending', NOW() + INTERVAL '2 days');

    -- 5. WhatsApp Interactions (NLP Ingestion)
    INSERT INTO whatsapp_interactions (customer_id, vehicle_id, phone, direction, raw_message, nlp_extracted_intent, nlp_extracted_symptoms, nlp_extracted_plate, sentiment_score, urgency, auto_reply_sent)
    VALUES 
        (cust3_id, veh3_id, '+60 16-554 2190', 'Inbound', 'Salam Airiel, my Proton X50 plate VAB 2020 has high pitched squeak when I step on the brakes. Can I drop by tomorrow afternoon?', 'Service Booking', '["squeaking brake noise", "braking friction"]'::jsonb, 'VAB 2020', 0.100, 'High', 'Waalaikumsalam Priya! We have reserved Bay 2 for your Proton X50 (VAB 2020) tomorrow at 2:30 PM for a complimentary front & rear brake inspection. Estimated inspection time: 45 mins.'),
        (cust1_id, veh1_id, '+60 12-345 6789', 'Inbound', 'Hi boss, my Myvi WXY 8821 engine vibrating heavily and yellow light came out on dashboard. How much to check?', 'Symptom Consultation', '["engine vibration", "check engine light"]'::jsonb, 'WXY 8821', -0.650, 'Urgent', 'Hi Ahmad! A flashing check engine light indicates an urgent issue, likely overdue maintenance or ignition coil misfire. Please bring your Myvi (WXY 8821) in right away for OBD-II computer diagnostic scanning (RM50, waived upon repair).');

    -- 6. AI Marketing Campaigns (Proactive Acquisition)
    INSERT INTO ai_campaigns (title, target_segment, service_type, promo_code, discount_pct, message_template, status, audience_count, sent_count, conversion_count, revenue_generated)
    VALUES 
        ('Penang Monsoon 25-Point Road Safety Drive', 'Vehicles > 3 Years', 'Brake & Wiper Safety Package', 'SAFEPENANG20', 20, 'Hi {name}! Monsoon season is here in Penang. Keep your {vehicle_model} safe on wet roads with our 25-point brake, tire and wiper safety check + free rain repellent treatment at Apex AutoWorks. Quote {promo_code} for 20% off!', 'Active', 85, 85, 23, 7820.00),
        ('Festive Holiday Long-Distance Travel Care', 'High Mileage > 50k', 'Comprehensive Fluids & Belt Package', 'BALIKKAMPUNG15', 15, 'Heading for a holiday road trip with your {vehicle_model}? Ensure smooth journeys with our Liqui Moly engine flush and cooling system test. Book online now and save 15%!', 'Active', 56, 56, 17, 6120.00);

    -- 7. Predictive Scores & Retention Recommendations
    INSERT INTO predictive_scores (customer_id, vehicle_id, churn_probability, lead_score, retention_risk_level, days_overdue, km_overdue, risk_factors, recommended_actions)
    VALUES 
        (cust1_id, veh1_id, 0.785, 35.00, 'High', 30, 3400, 
        '[{"factor": "Maintenance Overdue", "detail": "Vehicle has exceeded 5,000km interval by 3,400km without check-in."}, {"factor": "Touchpoint Gap", "detail": "Last recorded contact was 210 days ago."}, {"factor": "Negative Interaction", "detail": "Unresolved engine vibration reported on WhatsApp."}]'::jsonb,
        '[{"priority": "Urgent", "title": "Trigger Automated WhatsApp Service Reminder", "message": "Hi Ahmad, your Myvi WXY 8821 is 30 days overdue for engine oil replacement. Avoid engine wear—book today and get RM30 off synthetic oil package."}, {"priority": "High", "title": "PIC Direct Callback", "message": "Call Ahmad to schedule urgent OBD-II diagnostic check."}]'::jsonb),
        (cust5_id, veh5_id, 0.690, 42.00, 'High', 50, 4500,
        '[{"factor": "Major 40,000km Interval Missed", "detail": "Spark plugs and transmission oil due."}, {"factor": "Long Inactivity", "detail": "230 days since last workshop visit."}]'::jsonb,
        '[{"priority": "Urgent", "title": "Send 40k Major Care Package Promo", "message": "Hi Nurul, your Bezza KV 5502 is due for its 40,000km major service. Protect your gearbox with our genuine Perodua package."}]'::jsonb);

    -- 8. Business Strategist Insights
    INSERT INTO business_insights (report_type, repeat_service_rate, monthly_revenue, active_fleet_count, overdue_vehicle_count, demand_forecast, parts_inventory_alerts, pricing_recommendations, high_churn_accounts)
    VALUES (
        'Monthly Workshop Health & Demand Forecast',
        74.20,
        48250.00,
        142,
        18,
        '{"next_week_scheduled": 28, "predicted_oil_services": 19, "predicted_brake_repairs": 8, "predicted_major_services": 6}'::jsonb,
        '[{"part": "Liqui Moly 5W-30 Full Synthetic", "current_stock": 6, "reorder_threshold": 12, "urgency": "Urgent", "action": "Order 24 bottles from distributor"}, {"part": "Brembo Front Brake Pads (Myvi/Axia)", "current_stock": 2, "reorder_threshold": 5, "urgency": "High", "action": "Restock 8 sets before weekend"}]'::jsonb,
        '[{"service": "Brake System Flushing", "current_price": 80.00, "recommended_price": 95.00, "rationale": "High labor intensity and increased brake fluid cost in local Penang market."}, {"service": "Air Conditioning Package", "current_price": 240.00, "recommended_price": 220.00, "rationale": "Slight price reduction will boost seasonal monsoon adoption by 35%."}]'::jsonb,
        '[{"customer": "Ahmad Razali", "vehicle": "Myvi WXY 8821", "risk": "High (78.5%)", "revenue_at_risk": 950.00}, {"customer": "Nurul Huda", "vehicle": "Bezza KV 5502", "risk": "High (69.0%)", "revenue_at_risk": 680.00}]'::jsonb
    );
END $$;
