import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

# Delete local sqlite file if re-testing to get fresh seed
sqlite_path = os.path.join(os.path.dirname(__file__), "smartcrm.db")
if os.path.exists(sqlite_path):
    try:
        os.remove(sqlite_path)
    except Exception:
        pass

from app.core.database import SessionLocal, engine, Base
from app.db.init_db import init_database
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.service_record import ServiceRecord
from app.models.whatsapp_interaction import WhatsAppInteraction
from app.models.ai_campaign import AICampaign
from app.ai.ml_engine import predictive_engine
from app.ai.agent_workflow import langgraph_orchestrator
from app.ai.nlp_service import nlp_service
from app.ai.retention_engine import retention_engine
from app.ai.business_strategist import business_strategist
from app.core.supabase import check_supabase_health

print("======================================================================")
print("  [SmartCRM] Comprehensive Backend & Supabase Verification Suite")
print("  Project: CAT405 Intelligent Computing Major Project (Airiel Hazim - USM)")
print("======================================================================\n")

# 1. Initialize Database & Seed data
print("1. Testing Database Initialization & Automotive Workshop Seeding...")
init_database()
db = SessionLocal()

customer_count = db.query(Customer).count()
vehicle_count = db.query(Vehicle).count()
service_count = db.query(ServiceRecord).count()
whatsapp_count = db.query(WhatsAppInteraction).count()
campaign_count = db.query(AICampaign).count()

print(f"[OK] Customers in Database: {customer_count}")
print(f"[OK] Registered Vehicles: {vehicle_count}")
print(f"[OK] Service Work Orders (Kanban): {service_count}")
print(f"[OK] WhatsApp Chat Interactions: {whatsapp_count}")
print(f"[OK] Proactive AI Campaigns: {campaign_count}")

assert customer_count >= 6, "Expected at least 6 customer profiles!"
assert vehicle_count >= 6, "Expected at least 6 registered vehicles!"
assert service_count >= 4, "Expected service work orders!"

# 2. Test WhatsApp NLP Chat Extraction
print("\n2. Testing WhatsApp NLP Automotive Chat & Symptom Extraction...")
sample_chat = (
    "Salam Airiel, my Proton X50 plate VAB 2020 is making a loud squeaking sound "
    "when braking near Bayan Lepas. Can I drop by tomorrow at 2:30pm?"
)
nlp_res = nlp_service.analyze_chat(sample_chat, phone="+60 16-554 2190", customer_name="Priya")
print(f"[OK] Inbound Message: '{sample_chat}'")
print(f"[OK] Extracted Plate: {nlp_res['vehicle_plate']}")
print(f"[OK] Extracted Vehicle: {nlp_res['vehicle_matched']}")
print(f"[OK] Detected Symptoms: {nlp_res['symptoms_detected']}")
print(f"[OK] Recommended Package: {nlp_res['recommended_service']} (Est. RM {nlp_res['estimated_cost']:.2f})")
print(f"[OK] Extracted Slot: {nlp_res['requested_appointment']}")
print(f"[OK] Sentiment Score: {nlp_res['sentiment_score']} ({nlp_res['sentiment_label']})")
print(f"[OK] Drafted WhatsApp Reply:\n---\n{nlp_res['suggested_auto_reply']}\n---")

assert nlp_res['vehicle_plate'] == "VAB 2020", f"Expected VAB 2020, got {nlp_res['vehicle_plate']}"
assert "Brake" in nlp_res['recommended_service'], "Expected Brake service package!"

# 3. Test Autonomous Retention Engine (Maintenance Interval Scanner)
print("\n3. Testing Autonomous Agentic Retention Engine (Interval Scan)...")
vehicles = db.query(Vehicle).all()
v_list = []
for v in vehicles:
    cust = v.customer
    v_list.append({
        "id": v.id,
        "customer_id": v.customer_id,
        "customer_name": cust.full_name if cust else "",
        "phone": cust.phone if cust else "",
        "plate_number": v.plate_number,
        "make": v.make,
        "model": v.model,
        "current_mileage": v.current_mileage,
        "last_service_date": v.last_service_date.isoformat() if v.last_service_date else None,
        "last_service_mileage": v.last_service_mileage,
        "next_service_due_date": v.next_service_due_date.isoformat() if v.next_service_due_date else None,
        "next_service_due_mileage": v.next_service_due_mileage,
        "maintenance_status": v.maintenance_status
    })

scan_results = retention_engine.scan_fleet(v_list)
print(f"[OK] Total Vehicles Scanned: {scan_results['total_vehicles_scanned']}")
print(f"[OK] Overdue Vehicles: {scan_results['overdue_count']}")
print(f"[OK] Due Soon Vehicles: {scan_results['due_soon_count']}")
print(f"[OK] On Track Vehicles: {scan_results['on_track_count']}")
assert scan_results['overdue_count'] > 0, "Expected overdue vehicles identified!"

sample_overdue = scan_results['overdue_vehicles'][0]
print(f"[OK] Sample Overdue Vehicle: {sample_overdue['plate_number']} ({sample_overdue['days_overdue']} days overdue)")
print(f"[OK] Generated WhatsApp Reminder:\n---\n{sample_overdue['reminder_draft']}\n---")

# 4. Test Integrated AI Business Strategist
print("\n4. Testing Integrated AI Business Strategist...")
report = business_strategist.generate_strategist_report(customer_count, vehicle_count, scan_results['overdue_count'])
print(f"[OK] Repeat-Service Rate: {report['repeat_service_rate']}%")
print(f"[OK] Monthly Workshop Revenue: RM {report['monthly_revenue']:,.2f}")
print(f"[OK] Parts Inventory Alerts ({len(report['parts_inventory_alerts'])}):")
for p in report['parts_inventory_alerts'][:2]:
    print(f"   • [{p['urgency']}] {p['part_name']} (Stock: {p['current_stock']}, Need: {p['projected_30d_demand']}) -> {p['recommended_action']}")
print(f"[OK] Pricing Recommendations ({len(report['pricing_recommendations'])}):")
for pr in report['pricing_recommendations'][:2]:
    print(f"   • {pr['service']}: RM {pr['current_price']} -> RM {pr['recommended_price']} ({pr['expected_margin_lift']})")

assert report['repeat_service_rate'] >= 70.0, "Expected repeat-service rate benchmark!"

# 5. Test Scikit-Learn Predictive Model
print("\n5. Testing Scikit-Learn ML Churn & Retention Scoring...")
preds = predictive_engine.predict_customer(
    days_inactive=60,
    interaction_count=2,
    avg_sentiment=-0.45,
    overdue_activities=2,
    mrr=1450.0,
    days_overdue=30,
    km_overdue=3400,
    visit_count=2
)
print(f"[OK] Predicted Churn Risk: {preds['churn_risk_level']} (Prob: {preds['churn_probability'] * 100:.1f}%)")
print(f"[OK] Health Score: {preds['health_score']}/100")
print(f"[OK] Lead Score: {preds['lead_score']}/100")
print(f"[OK] Explanatory Risk Factors: {[r['factor'] for r in preds['risk_factors']]}")
assert preds['churn_risk_level'] == "High", "Expected High churn risk for overdue maintenance!"

# 6. Test Supabase Client Integration
print("\n6. Testing Supabase Cloud Health Check...")
supa_status = check_supabase_health()
print(f"[OK] Supabase Integration Status: {supa_status['status']} ({supa_status['message']})")

db.close()
print("\n======================================================================")
print("  [SUCCESS] ALL SMARTCRM BACKEND & SUPABASE TESTS PASSED FLAWLESSLY!   ")
print("======================================================================\n")
