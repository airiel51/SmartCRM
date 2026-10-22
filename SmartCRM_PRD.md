# SmartCRM - Product Requirements Document (PRD)
**Intelligent CRM for Independent Automotive Workshops**
*Target Stack: React + TypeScript (Web), Flutter (Mobile), Supabase / PostgreSQL (DB & Auth), Python FastAPI (AI & Integrations)*

---

## 1. Executive Summary & Purpose
Independent automotive repair and diagnostic workshops struggle with fragmented records, missed service follow-ups, manual WhatsApp lead intake, and lack of actionable operational insights. SmartCRM centralizes workshop operations into a multi-tenant, role-aware system supporting Owner/Admin and PIC/Staff workflows across Web and Mobile.

---

## 2. User Roles & Permissions
- **Owner / Admin**: Full administrative control, workshop settings, member management, financial metrics, service price configurations, campaign management, audit logs.
- **PIC / Staff (Person-In-Charge)**: Front-desk customer intake, vehicle registration, appointment scheduling, service job dispatching, inquiry extraction review, manual messaging.
- **Technician**: View assigned service jobs, update inspection checklists and odometer readings, mark jobs as ready for pickup.

---

## 3. Core Functional Requirements

### 3.1 Workshop Organization & Tenant Scoping
- All primary business entities scoped to a `workshop_id`.
- Tenant-scoped Row-Level Security (RLS) in PostgreSQL.
- API validation verifying the authenticated user is an active member of the workshop before granting data access.

### 3.2 Authentication & Role-Aware Navigation
- Supabase Auth + JWT-compatible session management.
- Web navigation with complete role gating:
  - **Overview (Dashboard)**
  - **Customers** (CRUD, search, archive, multi-vehicle linking)
  - **Vehicles** (CRUD, search, service history, odometer progression)
  - **Appointments** (Scheduling, calendar/list view, status lifecycle)
  - **Service Jobs** (Bay allocation, validated status transitions)
  - **Inquiries / Leads** (Manual entry & demo inbox, NLP extraction review)
  - **Reminders** (Predictive & rule-based upcoming/due/overdue service alerts)
  - **Analytics** (Real database metrics, zero fake stats)
  - **AI Insights** (Workshop recommendations with supporting evidence)
  - **Communications / Campaigns** (WhatsApp templates & simulated outbox)
  - **Settings** (Workshop profile, users, service intervals, integrations)

### 3.3 Customer & Vehicle Management
- Support multiple vehicles per customer.
- Plate number uniqueness within workshop / global formatting.
- Odometer history logs with recording timestamps and source.
- Soft-archiving for customers and vehicles with recovery capability.

### 3.4 Appointments & Service Job Lifecycle
- Appointments: `scheduled` -> `confirmed` -> `in_progress` -> `completed` / `cancelled`.
- Service Jobs: `draft` -> `pending_inspection` -> `in_progress` -> `waiting_parts` -> `ready_for_pickup` -> `completed` -> `invoiced`.
- Validated state transitions preventing impossible jumps.
- Real-time updates via Supabase publication / FastAPI webhooks.

### 3.5 Service Reminders & Interval Engine
- Transparent interval calculation based on:
  - Standard Oil Change: 5,000 km / 180 days
  - Synthetic Oil Change: 10,000 km / 365 days
  - Major Service: 40,000 km / 730 days
  - Brake Service: 20,000 km / 730 days
- Categorization into `upcoming` (due in < 14 days or < 500 km), `due`, and `overdue`.
- In-app reminder list with actions to schedule appointment or send WhatsApp reminder.
- Idempotency guard to prevent duplicate reminder generation.

### 3.6 Inquiry / Lead Extraction & Review (NLP)
- Ingestion of raw messages (WhatsApp / web forms / manual notes).
- Extraction schema:
  - Customer name, phone number
  - Vehicle registration (plate), make, model, year
  - Symptoms & issues reported
  - Requested service category
  - Preferred booking date & time
  - Extraction confidence (0.0 to 1.0)
- Guardrails: Strict rejection of hallucinated data (`null`/`unknown` when unclear).
- Mandatory staff approval before converting inquiry to canonical customer/vehicle/appointment records.

### 3.7 Analytics & Honest Metrics
- Calculated directly from actual records across selectable date filters.
- Zero fabricated metrics on empty data states; clean empty and onboarding states.
- Metrics: Revenue, active vehicles, job turnaround time, repeat visit rate, bay occupancy.

### 3.8 AI Workshop Recommendations
- Concrete, actionable recommendations with transparent evidentiary backing:
  - Lapsed customers with overdue maintenance
  - High-demand parts needing reorder
  - Seasonal service package suggestions
- Clear UI indicators showing whether suggestions originate from Google Gemini or Fallback Rule Engine.

### 3.9 WhatsApp Integration Adapter
- Official WhatsApp Business Platform / Cloud API adapter architecture.
- Safe default: Mock / Demo Mode active until real API credentials configured.
- Visual badge indicating Simulated / Demo mode.
- Consent and opt-out tracking.

---

## 4. Database Schema Requirements (Supabase / PostgreSQL)
1. `workshops`: Workshop profile, settings, currency, timezone.
2. `profiles` / `workshop_members`: User linkage to auth.users, role, status.
3. `customers`: Workshop-scoped customer records.
4. `vehicles`: Multi-vehicle relations linked to customers.
5. `appointments`: Time slots, service types, status.
6. `service_jobs`: Service bay, parts, labor, stage progression.
7. `mileage_logs`: Odometer audits with source tracking.
8. `inquiries`: Raw leads, extracted entities, review status.
9. `communication_logs`: Inbound and outbound message audits.
10. `service_reminders`: Computed and scheduled maintenance reminders.
11. `ai_recommendations`: Structured recommendations with evidence.
12. `activity_logs`: Workshop audit trail.

---

## 5. Security & Engineering Standards
- Server-side validation with Pydantic v2.
- Tenant isolation enforced via PostgreSQL RLS and FastAPI dependency injection.
- Zero committed secrets (`.env.example` with placeholders).
- Modular, typed React components with clean state management.
- Unit and integration tests for status transitions, reminder intervals, and extraction schemas.
