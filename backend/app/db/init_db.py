import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.service_record import ServiceRecord
from app.models.mileage_log import MileageLog
from app.models.whatsapp_interaction import WhatsAppInteraction
from app.models.ai_campaign import AICampaign
from app.models.predictive_score import PredictiveScore
from app.models.deal import Deal
from app.models.activity import Activity
from app.ai.agent_workflow import langgraph_orchestrator


def init_database():
    """Initializes schema and preloads initial automotive workshop dataset."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded with vehicles
        if db.query(Vehicle).count() > 0:
            return

        print("Seeding initial SmartCRM automotive workshop database...")

        # 1. Staff / PIC User
        pic_user = db.query(User).filter(User.email == "airiel@smartcrm.my").first()
        if not pic_user:
            pic_user = User(
                email="airiel@smartcrm.my",
                hashed_password="$2b$12$e80yqR9q1k9i601x02eS5.7xQ131bSjR5sZ0g1lK7k8xZk9n6mE7G",
                full_name="Airiel Hazim (Owner / PIC)",
                role="pic",
                phone="+60 12-456 7890",
                is_active=True
            )
            db.add(pic_user)
            db.flush()

        now = datetime.utcnow()

        # 2. Authentic Malaysian Automotive Customers & Vehicles
        seed_dataset = [
            {
                "full_name": "Ahmad Razali",
                "phone": "+60 12-345 6789",
                "email": "ahmad.razali@gmail.com",
                "address": "Taman Sri Nibong, Bayan Lepas, Penang",
                "status": "Overdue",
                "health_score": 38,
                "churn_risk": "High",
                "sentiment": "Negative",
                "total_spent": 1450.00,
                "visit_count": 3,
                "tags": ["Sedan Owner", "Commuter", "At Risk"],
                "last_visit_at": now - timedelta(days=210),
                "vehicle": {
                    "plate_number": "WXY 8821",
                    "make": "Perodua",
                    "model": "Myvi 1.5 AV",
                    "year": 2021,
                    "vin": "PM2M800K1234901",
                    "current_mileage": 58400,
                    "last_service_date": now - timedelta(days=210),
                    "last_service_mileage": 50000,
                    "next_service_due_date": now - timedelta(days=30),
                    "next_service_due_mileage": 55000,
                    "maintenance_status": "Overdue"
                },
                "service": {
                    "service_type": "50k Major Service & Diagnostics",
                    "stage": "Inquiry",
                    "bay": "Bay 1 (Engine)",
                    "symptoms": "Yellow check engine light blinking, engine vibration during idle.",
                    "diagnosis": "Overdue 8,400km past maintenance threshold. Throttle body and spark plugs need service.",
                    "labor": 120.00, "parts": 280.00, "total": 400.00
                },
                "whatsapp": {
                    "raw": "Hi boss, my Myvi WXY 8821 engine vibrating heavily and yellow light came out on dashboard. How much to check?",
                    "intent": "Symptom Consultation",
                    "symptoms": ["engine vibration", "check engine light"],
                    "plate": "WXY 8821",
                    "score": -0.650,
                    "urgency": "Urgent",
                    "reply": "Hi Ahmad! A flashing check engine light indicates an urgent issue, likely overdue maintenance or ignition coil misfire. Please bring your Myvi (WXY 8821) in right away for OBD-II computer diagnostic scanning (RM50, waived upon repair)."
                }
            },
            {
                "full_name": "Tan Wei Ming",
                "phone": "+60 17-882 1902",
                "email": "weiming.tan@outlook.com",
                "address": "Greenlane Heights, Georgetown, Penang",
                "status": "Active",
                "health_score": 92,
                "churn_risk": "Low",
                "sentiment": "Positive",
                "total_spent": 3820.00,
                "visit_count": 5,
                "tags": ["Enthusiast", "High Value", "Synthetic Preferred"],
                "last_visit_at": now - timedelta(days=45),
                "vehicle": {
                    "plate_number": "PNG 4419",
                    "make": "Honda",
                    "model": "Civic RS 1.5 VTEC Turbo",
                    "year": 2022,
                    "vin": "JHMFK7H89012345",
                    "current_mileage": 38200,
                    "last_service_date": now - timedelta(days=45),
                    "last_service_mileage": 35000,
                    "next_service_due_date": now + timedelta(days=135),
                    "next_service_due_mileage": 45000,
                    "maintenance_status": "On Track"
                },
                "service": {
                    "service_type": "Full Synthetic Engine Oil Service",
                    "stage": "Scheduled",
                    "bay": "Bay 1 (Engine)",
                    "symptoms": "Routine 10,000km synthetic oil service requested.",
                    "diagnosis": "Liqui Moly 5W-30 Full Synthetic with genuine Honda filter.",
                    "labor": 60.00, "parts": 268.00, "total": 328.00
                },
                "whatsapp": {
                    "raw": "Hello Airiel, I want to book next regular service for my Civic PNG 4419 this Saturday morning. Synthetic oil as usual please.",
                    "intent": "Service Booking",
                    "symptoms": ["periodic maintenance"],
                    "plate": "PNG 4419",
                    "score": 0.850,
                    "urgency": "Normal",
                    "reply": "Hi Wei Ming! We have scheduled Bay 1 for your Honda Civic (PNG 4419) this Saturday at 10:00 AM. 4L Liqui Moly 5W-30 ready. See you!"
                }
            },
            {
                "full_name": "Priya Subramaniam",
                "phone": "+60 16-554 2190",
                "email": "priya.subra@yahoo.com",
                "address": "Pulau Tikus, Penang",
                "status": "Due Soon",
                "health_score": 76,
                "churn_risk": "Medium",
                "sentiment": "Neutral",
                "total_spent": 2190.00,
                "visit_count": 4,
                "tags": ["SUV Owner", "Safety Focused"],
                "last_visit_at": now - timedelta(days=150),
                "vehicle": {
                    "plate_number": "VAB 2020",
                    "make": "Proton",
                    "model": "X50 1.5 TGDi Flagship",
                    "year": 2021,
                    "vin": "PL1TG50K7891234",
                    "current_mileage": 41800,
                    "last_service_date": now - timedelta(days=150),
                    "last_service_mileage": 35000,
                    "next_service_due_date": now + timedelta(days=10),
                    "next_service_due_mileage": 42000,
                    "maintenance_status": "Due Soon"
                },
                "service": {
                    "service_type": "Brake Pad & Rotor Inspection",
                    "stage": "In Progress",
                    "bay": "Bay 2 (Brakes)",
                    "symptoms": "Customer heard squeaking when braking downhill near Penang Bridge.",
                    "diagnosis": "Front brake pads worn down to 2.5mm. Rotors require skimming.",
                    "labor": 100.00, "parts": 340.00, "total": 440.00
                },
                "whatsapp": {
                    "raw": "Salam Airiel, my Proton X50 plate VAB 2020 has high pitched squeak when I step on the brakes. Can I drop by tomorrow afternoon?",
                    "intent": "Service Booking",
                    "symptoms": ["squeaking brake noise"],
                    "plate": "VAB 2020",
                    "score": 0.100,
                    "urgency": "High",
                    "reply": "Waalaikumsalam Priya! We have reserved Bay 2 for your Proton X50 (VAB 2020) tomorrow at 2:30 PM for a complimentary front & rear brake inspection."
                }
            },
            {
                "full_name": "Michael Wong",
                "phone": "+60 19-411 9832",
                "email": "mwong@apexlogistics.my",
                "address": "Gelugor, Penang",
                "status": "Active",
                "health_score": 88,
                "churn_risk": "Low",
                "sentiment": "Positive",
                "total_spent": 7600.00,
                "visit_count": 8,
                "tags": ["Commercial Fleet", "VIP Client"],
                "last_visit_at": now - timedelta(days=20),
                "vehicle": {
                    "plate_number": "JRS 7731",
                    "make": "Toyota",
                    "model": "Vios 1.5G Dual VVT-i",
                    "year": 2020,
                    "vin": "MR2NSP151234567",
                    "current_mileage": 72000,
                    "last_service_date": now - timedelta(days=20),
                    "last_service_mileage": 70000,
                    "next_service_due_date": now + timedelta(days=70),
                    "next_service_due_mileage": 75000,
                    "maintenance_status": "On Track"
                },
                "service": {
                    "service_type": "Air Conditioning Flush & Regas",
                    "stage": "Quality Inspection",
                    "bay": "Bay 3 (General)",
                    "symptoms": "Blower working but air is lukewarm during hot afternoons.",
                    "diagnosis": "Cabin pollen filter clogged and R134a refrigerant low. Vacuum tested no leaks.",
                    "labor": 70.00, "parts": 140.00, "total": 210.00
                },
                "whatsapp": {
                    "raw": "Hi Airiel, Vios JRS 7731 aircond is lukewarm. Please check cabin filter and gas during afternoon slot.",
                    "intent": "Service Booking",
                    "symptoms": ["air conditioning not cold"],
                    "plate": "JRS 7731",
                    "score": 0.300,
                    "urgency": "Normal",
                    "reply": "Hi Michael! Checked in Bay 3. We are vacuum testing the AC loop and will update once inspection is complete."
                }
            },
            {
                "full_name": "Nurul Huda",
                "phone": "+60 11-399 4410",
                "email": "nurul.huda@gmail.com",
                "address": "Relau, Bayan Lepas, Penang",
                "status": "Overdue",
                "health_score": 44,
                "churn_risk": "High",
                "sentiment": "Negative",
                "total_spent": 980.00,
                "visit_count": 2,
                "tags": ["First Time Car Owner", "Budget Minded", "At Risk"],
                "last_visit_at": now - timedelta(days=230),
                "vehicle": {
                    "plate_number": "KV 5502",
                    "make": "Perodua",
                    "model": "Bezza 1.3X",
                    "year": 2020,
                    "vin": "PM2M810B3344556",
                    "current_mileage": 44500,
                    "last_service_date": now - timedelta(days=230),
                    "last_service_mileage": 35000,
                    "next_service_due_date": now - timedelta(days=50),
                    "next_service_due_mileage": 40000,
                    "maintenance_status": "Overdue"
                },
                "service": {
                    "service_type": "Major 40k Service & Gearbox Flush",
                    "stage": "Inquiry",
                    "bay": "Bay 1 (Engine)",
                    "symptoms": "Car feels heavy when accelerating.",
                    "diagnosis": "Spark plugs worn, gearbox fluid dark, throttle valve carbonized.",
                    "labor": 110.00, "parts": 250.00, "total": 360.00
                },
                "whatsapp": {
                    "raw": "Salam, my Bezza KV 5502 overdue for service. How much for 40k service package?",
                    "intent": "Price Inquiry",
                    "symptoms": ["overdue service"],
                    "plate": "KV 5502",
                    "score": -0.200,
                    "urgency": "High",
                    "reply": "Waalaikumsalam Nurul! Our Perodua 40k package is RM360 inclusive of engine oil, oil filter, spark plugs and CVT fluid. Reply to confirm slot!"
                }
            },
            {
                "full_name": "Farhan Azman",
                "phone": "+60 12-990 1234",
                "email": "farhan.azman@corp.com",
                "address": "Tanjung Bungah, Penang",
                "status": "Active",
                "health_score": 95,
                "churn_risk": "Low",
                "sentiment": "Positive",
                "total_spent": 8450.00,
                "visit_count": 6,
                "tags": ["Continental", "VIP Client", "Brembo Upgrade"],
                "last_visit_at": now - timedelta(days=15),
                "vehicle": {
                    "plate_number": "BQP 9912",
                    "make": "BMW",
                    "model": "320i M Sport (G20)",
                    "year": 2022,
                    "vin": "WBA5R11030FG9812",
                    "current_mileage": 32400,
                    "last_service_date": now - timedelta(days=15),
                    "last_service_mileage": 30000,
                    "next_service_due_date": now + timedelta(days=165),
                    "next_service_due_mileage": 40000,
                    "maintenance_status": "On Track"
                },
                "service": {
                    "service_type": "Brake System & MOTUL 300V Oil Service",
                    "stage": "Ready for Pickup",
                    "bay": "Bay 4 (QC)",
                    "symptoms": "Scheduled performance fluid refresh.",
                    "diagnosis": "Motul 300V 5W-40, OEM BMW oil filter, Endless DOT4 brake fluid flush.",
                    "labor": 150.00, "parts": 480.00, "total": 630.00
                },
                "whatsapp": {
                    "raw": "Hi Airiel, BMW 320i BQP 9912 service done? Let me know when ready for pickup.",
                    "intent": "Pickup Inquiry",
                    "symptoms": ["routine service"],
                    "plate": "BQP 9912",
                    "score": 0.900,
                    "urgency": "Normal",
                    "reply": "Hi Farhan! Your BMW 320i (BQP 9912) is washed, vacuumed and ready for pickup at Bay 4. Invoice: RM 630."
                }
            }
        ]

        for item in seed_dataset:
            # 1. Customer
            cust = Customer(
                full_name=item["full_name"],
                phone=item["phone"],
                email=item["email"],
                address=item["address"],
                status=item["status"],
                health_score=item["health_score"],
                churn_risk=item["churn_risk"],
                sentiment=item["sentiment"],
                total_spent=item["total_spent"],
                visit_count=item["visit_count"],
                tags=item["tags"],
                last_visit_at=item["last_visit_at"]
            )
            db.add(cust)
            db.flush()

            # 2. Vehicle
            v = item["vehicle"]
            veh = Vehicle(
                customer_id=cust.id,
                plate_number=v["plate_number"],
                make=v["make"],
                model=v["model"],
                year=v["year"],
                vin=v["vin"],
                current_mileage=v["current_mileage"],
                last_service_date=v["last_service_date"],
                last_service_mileage=v["last_service_mileage"],
                next_service_due_date=v["next_service_due_date"],
                next_service_due_mileage=v["next_service_due_mileage"],
                maintenance_status=v["maintenance_status"]
            )
            db.add(veh)
            db.flush()

            # 3. Mileage Log
            ml = MileageLog(
                vehicle_id=veh.id,
                mileage=veh.current_mileage,
                source="Workshop Inspection",
                notes=f"Recorded during {v['maintenance_status']} evaluation"
            )
            db.add(ml)

            # 4. Service Record (Work Order)
            s = item["service"]
            sr = ServiceRecord(
                customer_id=cust.id,
                vehicle_id=veh.id,
                service_type=s["service_type"],
                odometer_reading=veh.current_mileage,
                service_bay=s["bay"],
                stage=s["stage"],
                symptoms_reported=s["symptoms"],
                diagnosis=s["diagnosis"],
                labor_cost=s["labor"],
                parts_cost=s["parts"],
                total_amount=s["total"],
                payment_status="Paid" if s["stage"] in ["Ready for Pickup", "Completed", "Invoiced"] else "Pending",
                scheduled_date=now
            )
            db.add(sr)
            db.flush()

            # Legacy Deal compatibility
            deal = Deal(
                customer_id=cust.id,
                title=f"{s['service_type']} - {v['plate_number']}",
                value=s["total"],
                stage="Proposal" if s["stage"] == "Inquiry" else ("Negotiation" if s["stage"] == "Scheduled" else ("Proposal" if s["stage"] == "In Progress" else "Closed Won")),
                win_probability=85 if s["stage"] in ["In Progress", "Quality Inspection"] else (100 if s["stage"] == "Ready for Pickup" else 50)
            )
            db.add(deal)

            # 5. WhatsApp Interaction
            w = item["whatsapp"]
            wi = WhatsAppInteraction(
                customer_id=cust.id,
                vehicle_id=veh.id,
                phone=cust.phone,
                direction="Inbound",
                raw_message=w["raw"],
                nlp_extracted_intent=w["intent"],
                nlp_extracted_symptoms=w["symptoms"],
                nlp_extracted_plate=w["plate"],
                sentiment_score=w["score"],
                urgency=w["urgency"],
                auto_reply_sent=w["reply"],
                booking_id=sr.id
            )
            db.add(wi)

            # 6. Activity / Reminder
            act = Activity(
                customer_id=cust.id,
                deal_id=deal.id,
                type="Task",
                title=f"Service Follow-up: {v['plate_number']} ({v['model']})",
                due_date=now + timedelta(days=2),
                priority="Urgent" if cust.churn_risk == "High" else "Normal",
                status="Pending"
            )
            db.add(act)

            # 7. LangGraph Predictive Score
            days_overdue = 30 if v["maintenance_status"] == "Overdue" else (0 if v["maintenance_status"] == "On Track" else 5)
            km_overdue = max(0, veh.current_mileage - veh.next_service_due_mileage)

            cust_ctx = {
                "id": cust.id,
                "full_name": cust.full_name,
                "name": cust.full_name,
                "company": f"{veh.make} {veh.model}",
                "phone": cust.phone,
                "plate_number": veh.plate_number,
                "total_spent": float(cust.total_spent),
                "last_visit_at": cust.last_visit_at.isoformat() if cust.last_visit_at else None,
                "interaction_count": 3,
                "avg_sentiment": float(w["score"]),
                "overdue_activities": 1 if cust.churn_risk == "High" else 0,
                "days_overdue": days_overdue,
                "km_overdue": km_overdue,
                "visit_count": cust.visit_count
            }
            audit_res = langgraph_orchestrator.run_workflow(cust_ctx)
            score_rec = PredictiveScore(
                customer_id=cust.id,
                vehicle_id=veh.id,
                lead_score=audit_res["lead_score"],
                churn_probability=audit_res["churn_probability"],
                retention_risk_level=audit_res["churn_risk_level"],
                days_overdue=days_overdue,
                km_overdue=km_overdue,
                model_version=audit_res["model_version"],
                risk_factors=audit_res["risk_factors"],
                recommended_actions=audit_res["recommended_actions"]
            )
            db.add(score_rec)

        # 8. Seed Proactive AI Campaigns
        campaigns = [
            AICampaign(
                title="Penang Monsoon 25-Point Road Safety Drive",
                target_segment="Vehicles > 3 Years",
                service_type="Brake & Wiper Safety Package",
                promo_code="SAFEPENANG20",
                discount_pct=20,
                message_template="Hi {name}! Monsoon season brings heavy rain in Penang. Ensure your {vehicle_model} stops safely with our Apex 25-Point Brake & Wiper Safety Inspection. Quote SAFEPENANG20 for 20% off!",
                status="Active",
                audience_count=85,
                sent_count=85,
                conversion_count=23,
                revenue_generated=7820.00
            ),
            AICampaign(
                title="Festive Holiday Long-Distance Travel Care",
                target_segment="High Mileage > 50,000km",
                service_type="Liqui Moly Full Synthetic Engine & Coolant Package",
                promo_code="BALIKKAMPUNG15",
                discount_pct=15,
                message_template="Planning a road trip with your {vehicle_model}? Prevent highway breakdowns with Apex pre-holiday engine oil flush and cooling test. Save 15% with BALIKKAMPUNG15!",
                status="Active",
                audience_count=56,
                sent_count=56,
                conversion_count=17,
                revenue_generated=6120.00
            )
        ]
        for c in campaigns:
            db.add(c)

        db.commit()
        print("SmartCRM automotive workshop database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
