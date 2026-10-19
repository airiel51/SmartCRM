from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.whatsapp_interaction import WhatsAppInteraction
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.service_record import ServiceRecord
from app.ai.nlp_service import nlp_service
from app.schemas.whatsapp import (
    WhatsAppInboundMessage, NLPExtractionResult, WhatsAppInteractionResponse, AutoBookRequest
)

router = APIRouter()


@router.get("/interactions", response_model=List[WhatsAppInteractionResponse])
def get_whatsapp_interactions(phone: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(WhatsAppInteraction)
    if phone:
        query = query.filter(WhatsAppInteraction.phone == phone)
    return query.order_by(WhatsAppInteraction.created_at.desc()).limit(50).all()


@router.post("/extract-chat", response_model=NLPExtractionResult)
def extract_chat_nlp(payload: WhatsAppInboundMessage, db: Session = Depends(get_db)):
    """
    Parses unstructured incoming WhatsApp message, extracts car license plate,
    symptoms, recommended workshop service, sentiment score, urgency, and auto-reply.
    """
    # Check if customer already exists by phone
    cust = db.query(Customer).filter(Customer.phone == payload.phone).first()
    cust_name = cust.full_name if cust else payload.sender_name

    nlp_result = nlp_service.analyze_chat(
        text=payload.message,
        phone=payload.phone,
        customer_name=cust_name
    )

    # Try matching vehicle by plate or customer
    plate = nlp_result.get("vehicle_plate")
    veh = None
    if plate:
        veh = db.query(Vehicle).filter(Vehicle.plate_number.ilike(f"%{plate.replace(' ', '')}%")).first()
    elif cust and cust.vehicles:
        veh = cust.vehicles[0]

    if veh:
        nlp_result["vehicle_id"] = veh.id
        nlp_result["vehicle_plate"] = veh.plate_number
        nlp_result["vehicle_matched"] = f"{veh.make} {veh.model} ({veh.plate_number})"
    if cust:
        nlp_result["customer_id"] = cust.id
        nlp_result["customer_name"] = cust.full_name

    return NLPExtractionResult(**nlp_result)


@router.post("/auto-book")
def auto_book_from_chat(payload: AutoBookRequest, db: Session = Depends(get_db)):
    """
    Takes extracted WhatsApp details and atomically registers Customer, Vehicle,
    and creates a scheduled Work Order in the workshop Kanban!
    """
    # 1. Find or create customer
    cust = db.query(Customer).filter(Customer.phone == payload.phone).first()
    if not cust:
        cust = Customer(
            full_name=payload.customer_name or "WhatsApp Car Owner",
            phone=payload.phone,
            status="Active",
            health_score=85,
            churn_risk="Low",
            sentiment="Positive",
            tags=["WhatsApp Booking", "New Intake"]
        )
        db.add(cust)
        db.flush()

    # 2. Find or create vehicle
    clean_plate = payload.plate_number.strip().upper()
    veh = db.query(Vehicle).filter(Vehicle.plate_number == clean_plate).first()
    if not veh:
        veh = Vehicle(
            customer_id=cust.id,
            plate_number=clean_plate,
            make=payload.make or "Vehicle",
            model=payload.model or "Model",
            year=2021,
            current_mileage=35000,
            maintenance_status="On Track"
        )
        db.add(veh)
        db.flush()

    # 3. Create Service Record
    service_record = ServiceRecord(
        customer_id=cust.id,
        vehicle_id=veh.id,
        service_type=payload.service_type,
        odometer_reading=veh.current_mileage,
        service_bay="Bay 2" if "Brake" in payload.service_type else "Bay 1",
        stage="Scheduled",
        symptoms_reported=payload.symptoms or "Extracted from WhatsApp conversation.",
        labor_cost=80.00,
        parts_cost=max(payload.estimated_amount - 80.00, 60.00),
        total_amount=payload.estimated_amount,
        scheduled_date=datetime.utcnow()
    )
    db.add(service_record)
    db.flush()

    # 4. Log WhatsApp Interaction
    interaction = WhatsAppInteraction(
        customer_id=cust.id,
        vehicle_id=veh.id,
        phone=cust.phone,
        direction="Inbound",
        raw_message=f"Direct booking confirmed for {payload.service_type} ({clean_plate}).",
        nlp_extracted_intent="Service Booking",
        nlp_extracted_symptoms=[payload.symptoms] if payload.symptoms else [],
        nlp_extracted_plate=clean_plate,
        sentiment_score=0.800,
        urgency="Normal",
        auto_reply_sent=f"Booking confirmed for {clean_plate} at Apex AutoWorks. Bay slot reserved!",
        booking_id=service_record.id
    )
    db.add(interaction)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully created booking for {clean_plate} ({payload.service_type})",
        "booking_id": service_record.id,
        "customer_id": cust.id,
        "vehicle_id": veh.id,
        "stage": service_record.stage,
        "bay": service_record.service_bay
    }
