# SmartCRM: Intelligent Automotive Workshop Customer Relationship Management System with Customer Analytics
**CAT405 Intelligent Computing Major Project**  
*Author: Airiel Hazim Bin Redzuan Ng (Universiti Sains Malaysia)*  
*Supervisor: Dr. Mohd Nadhir Ab Wahab*

SmartCRM is an intelligent, domain-specific Customer Relationship Management system designed specifically for **automotive repair workshops and service centres**. It resolves manual record-keeping failures, reactive retention drift, and fragmented communication channels by uniting:
1. **Pillar 1: Cross-Platform Web (React) & Mobile Shop-Floor Interface**
2. **Pillar 2: Supabase-Managed PostgreSQL Database** (multi-vehicle linking, RLS, real-time sync)
3. **Pillar 3: Python FastAPI Backend & Agentic AI Orchestration Layer** (WhatsApp automation, NLP chat symptom extraction, autonomous retention engine, proactive acquisition agent, integrated business strategist)

---

## 1. System Architecture & The Three Pillars

```
       ┌────────────────────────────────────────────────────────────────────────┐
       │             Pillar 1: Cross-Platform UI Layer (React & Mobile)         │
       │ - React 18 Web Dashboard (Workshop Command Center & PIC Operations)    │
       │ - WhatsApp AI Live Center & Real-Time Symptom Extraction Inspector     │
       │ - Service Bays & Work Order Kanban (Bays 1-4, QC, Ready for Pickup)    │
       │ - Vehicle Fleet & Client 360° Profile Drawer                           │
       │ - Agentic AI Suite (Retention, Acquisition, Business Strategist)       │
       └───────────────────────────────────┬────────────────────────────────────┘
                                           │ HTTP REST / WebSocket JSON
                                           ▼
       ┌────────────────────────────────────────────────────────────────────────┐
       │             Pillar 3: Python FastAPI Integration & AI Layer            │
       │ - Asynchronous Non-Blocking Handlers & Pydantic V2 Validation          │
       │ - WhatsApp Messaging Automation & Simulator Webhook                    │
       │ - NLP Chat Extraction Module (License Plate, Make, Model, Symptoms)    │
       │ - Autonomous Retention Engine (5k/10k/20k/40k Maintenance Scanners)   │
       │ - Proactive Lead Acquisition Agent (Targeted Marketing Broadcasts)     │
       │ - Integrated AI Business Strategist (Prescriptive Parts & Pricing)     │
       └──────────────────┬────────────────────────────────┬────────────────────┘
                          │ Direct Client Connection       │ Connection Pool
                          ▼                                ▼
       ┌────────────────────────────────────────────────────────────────────────┐
       │             Pillar 2: Supabase Relational Database Layer               │
       │ - PostgreSQL 16 Relational Engine with ACID Compliance                 │
       │ - Multi-Vehicle Linking, Mileage Logs & Service Records                │
       │ - Row-Level Security (RLS) & Multi-Role Permissions (Owner, PIC, Tech) │
       │ - Real-time Replication Publication (`supabase_realtime`)              │
       └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Modules & Features

### 🚘 Vehicle Fleet & Customer Intake (`/customers`, `/vehicles`)
- Multi-vehicle linking per customer (e.g. Proton X50, Perodua Myvi, Honda Civic, Toyota Vios, BMW 320i).
- License plate indexing, odometer progression tracking, and maintenance status calculation (`On Track`, `Due Soon`, `Overdue`).
- Customer 360° drawer showing vehicle specs, service timeline, mileage logs, and WhatsApp conversation history.

### 💬 WhatsApp AI Live Center & NLP Chat Extraction (`/whatsapp`)
- Ingests unstructured incoming WhatsApp customer messages.
- Real-time NLP extracts:
  - License Plate (e.g., `PNG 4419`, `VAB 2020`, `WXY 8821`).
  - Vehicle Make and Model.
  - Reported Symptoms (e.g., squeaking brakes, engine vibration, lukewarm air conditioning, oil leaks).
  - Recommended Workshop Service Package & Estimated Quote (MYR).
  - Requested Appointment Slot (e.g., "Tomorrow at 2:30 PM", "Saturday 10 AM").
  - Sentiment Polarity (-1.0 to 1.0) & Urgency Level (`Normal`, `High`, `Urgent`).
  - Pre-drafted automated WhatsApp confirmation message.
- 1-Click **"Convert into Confirmed Workshop Booking"** automatically registers customer, vehicle, and work order in Kanban!

### 🔧 Service Bays & Work Order Kanban (`/services`, `/pipeline`)
- 6 Automotive Stages:
  1. `Inquiry`: Chat Inquiries & Quotes
  2. `Scheduled`: Scheduled & Checked In
  3. `In Progress`: Bay Work (Bays 1 to 4)
  4. `Quality Inspection`: QC & Road Testing
  5. `Ready for Pickup`: Completed & Ready for Customer
  6. `Invoiced`: Invoiced & Payment Settled
- Drag/move stages, parts & labor cost breakdown, bay reassignment, and technician notes.

### 🤖 Agentic AI Suite (`/retention`, `/acquisition`, `/strategist`)
1. **Autonomous Retention Engine**:
   - Fleet-wide maintenance scanner evaluating mileage against intervals (Oil: 5,000 km; Synthetic: 10,000 km; Brakes: 20,000 km; Major: 40,000 km).
   - Computes days overdue, km overdue, and churn risk.
   - Generates personalized WhatsApp maintenance reminders with 1-click send trigger.
2. **Proactive AI Acquisition Agent**:
   - Analyzes vehicle age cohorts and seasonal demand (Monsoon Safety Drive, Festive Balik Kampung Package, Summer AC Refresh).
   - Generates promotional copy with promo codes and tracks broadcast conversion rates.
3. **Integrated AI Business Strategist**:
   - Repeat-Service Rate calculation (**74.2%** loyalty benchmark).
   - Predictive 30-Day Parts Inventory Demand (Liqui Moly 5W-30 synthetic oil, Brembo brake pads, R134a refrigerant, Iridium spark plugs).
   - Dynamic Pricing & Labor Rate margin lift recommendations.
   - High-Risk Churn Account Intervention List.

---

## 3. Quick Start & Local Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- (Optional) Free Supabase Account at [supabase.com](https://supabase.com)

### 1. Run the Python FastAPI Backend
```powershell
# In project root:
backend\venv\Scripts\activate

# Run backend verification suite:
python backend\verify_backend.py

# Start FastAPI server on port 8000:
uvicorn app.main:app --app-dir backend --reload --port 8000
```
- Interactive Swagger API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Status: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Run the React Web Dashboard
```powershell
# In frontend directory:
cd frontend
npm run dev
```
- Open browser at: [http://localhost:5173](http://localhost:5173)

---

## 4. Supabase Setup & Cloud Migration

1. Create a new project in your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** in Supabase.
3. Open `supabase/schema.sql` (or view it directly inside the web UI at `Supabase Cloud Sync`).
4. Paste the entire SQL script and click **Run**.
5. Copy your **Project URL** and **anon public key** from *Project Settings -> API*.
6. Add them to `.env`:
   ```ini
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-key
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
7. SmartCRM will automatically connect and synchronize in real-time!

---

## 5. Verification Suite Results

Run `python backend/verify_backend.py` to validate all modules end-to-end:
```
======================================================================
  [SmartCRM] Comprehensive Backend & Supabase Verification Suite
  Project: CAT405 Intelligent Computing Major Project (Airiel Hazim - USM)
======================================================================

1. Testing Database Initialization & Automotive Workshop Seeding...
[OK] Customers in Database: 6
[OK] Registered Vehicles: 6
[OK] Service Work Orders (Kanban): 6
[OK] WhatsApp Chat Interactions: 6
[OK] Proactive AI Campaigns: 2

2. Testing WhatsApp NLP Automotive Chat & Symptom Extraction...
[OK] Inbound Message: 'Salam Airiel, my Proton X50 plate VAB 2020 is making a loud squeaking sound when braking near Bayan Lepas. Can I drop by tomorrow at 2:30pm?'
[OK] Extracted Plate: VAB 2020
[OK] Extracted Vehicle: Proton X50 (VAB 2020)
[OK] Detected Symptoms: ['Brake System Friction & Squeaking Noise']
[OK] Recommended Package: Brake Pad & Rotor Inspection & Replacement (Est. RM 280.00)
[OK] Extracted Slot: Tomorrow at 2:30PM
[OK] Sentiment Score: -0.247 (Negative)

3. Testing Autonomous Agentic Retention Engine (Interval Scan)...
[OK] Total Vehicles Scanned: 6
[OK] Overdue Vehicles: 2
[OK] Due Soon Vehicles: 1
[OK] On Track Vehicles: 3

4. Testing Integrated AI Business Strategist...
[OK] Repeat-Service Rate: 74.2%
[OK] Monthly Workshop Revenue: RM 48,250.00
[OK] Parts Inventory Alerts (4 items with urgent restock indicators)
[OK] Pricing Recommendations (3 prescriptive optimizations)

5. Testing Scikit-Learn ML Churn & Retention Scoring...
[OK] Predicted Churn Risk: High (Prob: 83.9%)
[OK] Health Score: 24/100

6. Testing Supabase Cloud Health Check...
[OK] Supabase Integration Status: Verified

======================================================================
  [SUCCESS] ALL SMARTCRM BACKEND & SUPABASE TESTS PASSED FLAWLESSLY!   
======================================================================
```
