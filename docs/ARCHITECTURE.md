# SmartCRM — Technical Architecture & Integration Blueprint
**Intelligent Automotive Workshop Customer Relationship Management System with Customer Analytics**  
*CAT405 Intelligent Computing Major Project (Airiel Hazim Bin Redzuan Ng, Dr. Mohd Nadhir Ab Wahab — USM)*

---

## 1. Multi-Tier System Architecture (The Three Pillars)

```
       ┌────────────────────────────────────────────────────────────────────────┐
       │             Pillar 1: Cross-Platform UI Layer (React & Mobile)         │
       │ - React 18 Web Dashboard (Executive Workshop Command Center)           │
       │ - Mobile Shop-Floor Interface (Rapid Plate Scan, Bay Work Status)      │
       │ - Real-time Supabase Client Synchronization & WebSocket Listeners      │
       └───────────────────────────────────┬────────────────────────────────────┘
                                           │ HTTP REST / WebSocket JSON
                                           ▼
       ┌────────────────────────────────────────────────────────────────────────┐
       │             Pillar 3: Python FastAPI Integration & AI Layer            │
       │ - Asynchronous Non-Blocking Handlers & Pydantic V2 Schemas             │
       │ - WhatsApp Messaging Automation & Inbound Chat Webhook Simulator       │
       │ - NLP Chat Extraction Module (Plate, Model, Symptoms, Auto-Quote)      │
       │ - Autonomous Agentic Retention Engine (Maintenance Interval Scanner)   │
       │ - Proactive AI Lead Acquisition Agent (Segmented Campaign Generator)   │
       │ - Integrated AI Business Strategist (Prescriptive Demand & Pricing)    │
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

## 2. Core Modules & Responsibilities

### 2.1 Pillar 1: Web Dashboard & Shop-Floor Interface (React + Vite)
- **Workshop Command Center**:
  - Top-line KPIs: Active Fleet (142 Vehicles), Overdue Maintenance (18 Alerts), WhatsApp Inquiries Pending, Repeat-Service Rate (74.2%), Monthly Revenue (RM 48,250.00).
  - Live Service Bay Monitor: Bay 1 (Engine), Bay 2 (Brakes), Bay 3 (AC/General), Bay 4 (QC Inspection).
  - Urgent Retention Intervention Feed with 1-click WhatsApp reminder triggers.
- **Service Bays & Work Order Kanban (`/pipeline`)**:
  - 6 Workshop Stages: `Inquiry`, `Scheduled`, `In Progress`, `Quality Inspection`, `Ready for Pickup`, `Invoiced`.
  - Parts and labor cost calculation with technician notes.
- **WhatsApp AI Live Hub & NLP Extractor (`/whatsapp`)**:
  - Real-time WhatsApp Phone Simulator and NLP entity extraction inspector.
  - Automatic entity recognition for license plates, car symptoms, and auto-reply quotes.
  - 1-Click "Convert into Confirmed Workshop Booking".
- **Vehicle Fleet & Client 360° Directory (`/customers`)**:
  - Searchable by plate number, phone, or owner name.
  - Multi-vehicle linking drawer with complete service log history and mileage progression.
- **Agentic AI Suite (`/agentic_ai`)**:
  - Sub-tab 1: Autonomous Retention Engine (interval scanner, overdue tables, reminders).
  - Sub-tab 2: Proactive Acquisition Agent (marketing campaigns, segment broadcasting).
  - Sub-tab 3: Integrated AI Business Strategist (predictive parts demand, margin recommendations).
- **Supabase Cloud Sync View (`/supabase`)**:
  - Connection health test, DDL SQL viewer, and RLS policy matrix.

### 2.2 Pillar 2: Supabase Data Layer (PostgreSQL)
- **Database Schema**:
  - `workshop_profiles`: Workshop details, PIC contact, business registration.
  - `workshop_users`: RBAC staff accounts (`admin`, `pic`, `technician`).
  - `customers`: Vehicle owners, phone numbers, health scores, churn risks, total spend.
  - `vehicles`: License plates, make, model, current mileage, maintenance thresholds.
  - `mileage_logs`: Odometer progression entries.
  - `service_records`: Work orders, bay assignments, symptoms, diagnosis, parts & labor cost.
  - `whatsapp_interactions`: Inbound & outbound messages, NLP intent, sentiment scores.
  - `ai_campaigns`: Proactive marketing campaigns and broadcast conversions.
  - `predictive_scores`: ML churn probabilities, lead scores, overdue metrics.
  - `business_insights`: Executive reports, demand forecasts, inventory reorder alerts.
- **Row-Level Security (RLS)**:
  - Enabled across all tables with role-based policies.
  - Real-time synchronization enabled via `supabase_realtime` publication.

### 2.3 Pillar 3: FastAPI Backend & Agentic AI Orchestration
- **NLP Chat Extraction Module (`app/ai/nlp_service.py`)**:
  - License plate parsing with regex boundary protection.
  - Automotive symptom extraction (squeaking brakes, engine vibration, lukewarm AC, transmission jerk).
  - Automatic workshop package matching with pre-drafted WhatsApp reply.
- **Autonomous Retention Engine (`app/ai/retention_engine.py`)**:
  - Evaluates vehicle mileage against maintenance thresholds (Engine Oil: 5,000 km / 180 days; Synthetic: 10,000 km / 365 days; Brakes: 20,000 km; Major: 40,000 km).
  - Dispatches personalized reminders via WhatsApp.
- **Proactive Acquisition Agent (`app/ai/acquisition_agent.py`)**:
  - Generates targeted campaigns for customer cohorts (cars > 5 yrs, monsoon road trip safety, seasonal AC refresh).
- **Integrated AI Business Strategist (`app/ai/business_strategist.py`)**:
  - Repeat-service rate calculation (74.2% automotive benchmark).
  - Predictive parts demand forecast (Liqui Moly 5W-30 oil, Brembo brake pads, R134a refrigerant, Iridium spark plugs).
  - Prescriptive pricing and labor rate adjustments.
- **Scikit-Learn Predictive Classifier (`app/ai/ml_engine.py`)**:
  - Random Forest and logistic regression evaluating touchpoint latency, overdue days, sentiment polarity, and visit loyalty.
