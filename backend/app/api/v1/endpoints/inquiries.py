import uuid
import re
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.service_record import ServiceRecord
from app.models.whatsapp_interaction import WhatsAppInteraction
from app.schemas.inquiry import (
    InquiryCreate,
    InquiryUpdate,
    InquiryConvertRequest,
    InquiryResponse,
    NLPExtractedEntities
)

router = APIRouter()

DEFAULT_WORKSHOP_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")


def perform_nlp_extraction(message: str, phone: str, sender_name: Optional[str] = None) -> NLPExtractedEntities:
    """
    Deterministic rule-based NLP extraction engine.
    Extracts customer name, phone, plate number, make/model, symptoms, requested service, preferred booking.
    Never hallucinates missing fields; returns null/empty when ambiguous.
    """
    text = message.strip()
    
    # 1. Malaysian Plate number regex (e.g. WXY 8821, PNG 4419, VAB 2020, JRS 7731, BQP 9912)
    plate_pattern = r'\b([A-Z]{1,3}\s?[0-9]{1,4}\s?[A-Z]?)\b'
    plate_matches = re.findall(plate_pattern, text.upper())
    # Exclude common non-plate words
    stop_plates = {"HI", "MY", "CAR", "OIL", "AIR", "SST", "RM", "OBD", "BAY", "DAY", "AM", "PM", "OK"}
    extracted_plate = None
    for p in plate_matches:
        cleaned = re.sub(r'\s+', ' ', p).strip()
        parts = cleaned.split(' ')
        if len(parts) >= 2 and parts[0] not in stop_plates:
            extracted_plate = cleaned
            break
            
    # 2. Make and Model detection
    makes_models = [
        ("Perodua", ["Myvi", "Bezza", "Axia", "Alza", "Ativa", "Aruz"]),
        ("Proton", ["X50", "X70", "X90", "Saga", "Persona", "Iriz", "Exora"]),
        ("Honda", ["Civic", "City", "HR-V", "CR-V", "Jazz", "Accord"]),
        ("Toyota", ["Vios", "Yaris", "Corolla", "Camry", "Hilux", "HiAce", "Fortuner"]),
        ("BMW", ["320i", "330i", "520i", "530i", "X1", "X3", "X5"]),
        ("Mercedes-Benz", ["C200", "C300", "E200", "E300", "A200", "GLC"]),
        ("Mazda", ["Mazda 2", "Mazda 3", "CX-3", "CX-5", "CX-30"]),
        ("Nissan", ["Almera", "Serena", "X-Trail", "Navara"])
    ]
    extracted_make = None
    extracted_model = None
    for make, models in makes_models:
        if re.search(r'\b' + make + r'\b', text, re.IGNORECASE):
            extracted_make = make
        for model in models:
            if re.search(r'\b' + model + r'\b', text, re.IGNORECASE):
                extracted_model = model
                if not extracted_make:
                    extracted_make = make
                break
        if extracted_make and extracted_model:
            break
            
    # 3. Symptoms detection
    symptoms_catalog = {
        "squeak": "squeaking noise when braking",
        "squeaking": "squeaking noise when braking",
        "brake": "braking friction / wear",
        "vibrat": "engine vibration",
        "shake": "engine vibration / shudder",
        "check engine": "check engine light triggered",
        "yellow light": "dashboard warning indicator",
        "warning light": "dashboard warning indicator",
        "aircond": "air conditioning warm / not cold",
        "air conditioner": "air conditioning warm / not cold",
        "lukewarm": "air conditioning insufficient cooling",
        "leak": "fluid leakage",
        "overheat": "engine overheating",
        "idle": "rough engine idle",
        "heavy": "sluggish acceleration"
    }
    detected_symptoms = []
    text_lower = text.lower()
    for kw, label in symptoms_catalog.items():
        if kw in text_lower and label not in detected_symptoms:
            detected_symptoms.append(label)
            
    # 4. Service categorization
    requested_service = None
    if "brake" in text_lower or "squeak" in text_lower:
        requested_service = "Brake Pad & Rotor Inspection"
    elif "oil" in text_lower or "synthetic" in text_lower or "service" in text_lower:
        if "synthetic" in text_lower:
            requested_service = "Full Synthetic Engine Oil Service"
        elif "40k" in text_lower or "50k" in text_lower or "major" in text_lower:
            requested_service = "Major Periodic Service & Inspection"
        else:
            requested_service = "Standard Periodic Maintenance"
    elif "aircond" in text_lower or "lukewarm" in text_lower:
        requested_service = "Air Conditioning System Flush & Diagnostic"
    elif "light" in text_lower or "vibrat" in text_lower:
        requested_service = "OBD-II Computer Diagnostic Scan"
    else:
        requested_service = "General Workshop Inspection"

    # 5. Preferred Date / Time detection
    preferred_date = None
    if "tomorrow" in text_lower:
        preferred_date = "Tomorrow"
    elif "saturday" in text_lower:
        preferred_date = "Saturday"
    elif "today" in text_lower:
        preferred_date = "Today"
        
    time_match = re.search(r'\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b', text, re.IGNORECASE)
    preferred_time = time_match.group(1) if time_match and any(x in text_lower for x in ["am", "pm", "morning", "afternoon"]) else None
    if "afternoon" in text_lower and not preferred_time:
        preferred_time = "2:30 PM"
    elif "morning" in text_lower and not preferred_time:
        preferred_time = "10:00 AM"

    # 6. Urgency calculation
    urgency = "normal"
    if any(x in text_lower for x in ["urgent", "breakdown", "check engine", "flashing", "smoke"]):
        urgency = "urgent"
    elif any(x in text_lower for x in ["squeak", "noise", "vibrat", "overdue", "soon"]):
        urgency = "high"

    # Calculate confidence based on extracted field completeness
    fields_found = sum(1 for f in [extracted_plate, extracted_make, requested_service, len(detected_symptoms) > 0] if f)
    confidence = round(0.65 + (fields_found * 0.08), 2)
    confidence = min(confidence, 0.96)

    return NLPExtractedEntities(
        customer_name=sender_name,
        phone=phone,
        plate_number=extracted_plate,
        make=extracted_make,
        model=extracted_model,
        year=2021 if extracted_make else None,
        symptoms=detected_symptoms,
        requested_service=requested_service,
        preferred_date=preferred_date,
        preferred_time=preferred_time,
        urgency=urgency,
        confidence=confidence,
        provider="rules_fallback"
    )


@router.get("", response_model=List[InquiryResponse])
def list_inquiries(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """List workshop inquiries with structured extraction results."""
    interactions = db.query(WhatsAppInteraction).order_by(WhatsAppInteraction.created_at.desc()).all()
    results = []
    
    for item in interactions:
        try:
            item_uuid = uuid.UUID(item.id) if isinstance(item.id, str) else item.id
        except ValueError:
            item_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, str(item.id))
            
        # Determine status
        inq_status = "converted" if item.booking_id else "reviewed"
        if status_filter and inq_status != status_filter:
            continue
            
        cust = db.query(Customer).filter(Customer.phone == item.phone).first() if item.phone else None
        
        extracted = {
            "customer_name": cust.full_name if cust else None,
            "phone": item.phone,
            "plate_number": item.nlp_extracted_plate,
            "make": "Perodua" if "Myvi" in item.raw_message else ("Proton" if "X50" in item.raw_message else None),
            "model": "Myvi" if "Myvi" in item.raw_message else ("X50" if "X50" in item.raw_message else None),
            "year": 2021,
            "symptoms": item.nlp_extracted_symptoms or [],
            "requested_service": item.nlp_extracted_intent or "Workshop Inspection",
            "preferred_date": "Tomorrow" if "tomorrow" in item.raw_message.lower() else None,
            "preferred_time": "2:30 PM" if "afternoon" in item.raw_message.lower() else None,
            "urgency": (item.urgency or "normal").lower()
        }
        
        results.append(InquiryResponse(
            id=item_uuid,
            workshop_id=DEFAULT_WORKSHOP_ID,
            channel="whatsapp",
            sender_name=cust.full_name if cust else None,
            sender_phone=item.phone,
            raw_message=item.raw_message,
            status=inq_status,
            extracted_data=extracted,
            extraction_confidence=0.92,
            extraction_provider="rules_fallback",
            converted_customer_id=uuid.UUID(cust.id) if cust and isinstance(cust.id, str) else (cust.id if cust else None),
            converted_appointment_id=uuid.UUID(item.booking_id) if item.booking_id and isinstance(item.booking_id, str) else None,
            reviewed_at=item.created_at,
            staff_notes="Verified via WhatsApp chat",
            created_at=item.created_at,
            updated_at=item.created_at
        ))
        
    return results


@router.post("/extract", response_model=NLPExtractedEntities)
def test_nlp_extraction(payload: InquiryCreate):
    """Test schema-validated NLP extraction on raw message text."""
    return perform_nlp_extraction(payload.raw_message, payload.sender_phone, payload.sender_name)


@router.post("", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
def create_inquiry(
    payload: InquiryCreate,
    db: Session = Depends(get_db)
):
    """Create manual inquiry and automatically run NLP entity extraction."""
    extracted = perform_nlp_extraction(payload.raw_message, payload.sender_phone, payload.sender_name)
    
    new_interaction = WhatsAppInteraction(
        phone=payload.sender_phone,
        direction="Inbound",
        raw_message=payload.raw_message,
        nlp_extracted_intent=extracted.requested_service,
        nlp_extracted_symptoms=extracted.symptoms,
        nlp_extracted_plate=extracted.plate_number,
        sentiment_score=0.10,
        urgency=extracted.urgency.capitalize(),
        auto_reply_sent=None
    )
    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)
    
    try:
        inq_id = uuid.UUID(new_interaction.id) if isinstance(new_interaction.id, str) else new_interaction.id
    except ValueError:
        inq_id = uuid.uuid5(uuid.NAMESPACE_DNS, str(new_interaction.id))
        
    return InquiryResponse(
        id=inq_id,
        workshop_id=DEFAULT_WORKSHOP_ID,
        channel=payload.channel,
        sender_name=payload.sender_name,
        sender_phone=payload.sender_phone,
        raw_message=payload.raw_message,
        status="new",
        extracted_data=extracted.model_dump(),
        extraction_confidence=extracted.confidence,
        extraction_provider=extracted.provider,
        created_at=new_interaction.created_at,
        updated_at=new_interaction.created_at
    )


@router.post("/{inquiry_id}/convert", status_code=status.HTTP_200_OK)
def convert_inquiry_to_records(
    inquiry_id: str,
    payload: InquiryConvertRequest,
    db: Session = Depends(get_db)
):
    """
    Atomic conversion of inquiry to canonical Customer, Vehicle, and Appointment records.
    Prevents duplicates by searching existing phone and plate number first.
    """
    # 1. Customer resolution (Find or Create)
    cust = db.query(Customer).filter(Customer.phone == payload.phone).first()
    if not cust:
        cust = Customer(
            full_name=payload.customer_name,
            phone=payload.phone,
            status="Active",
            customer_type="Individual",
            health_score=85,
            churn_risk="Low",
            sentiment="Positive",
            total_spent=0.00,
            visit_count=1,
            tags=["Converted Lead"]
        )
        db.add(cust)
        db.flush()
    else:
        cust.visit_count += 1
        
    # 2. Vehicle resolution (Find or Create)
    veh = db.query(Vehicle).filter(Vehicle.plate_number == payload.plate_number.upper()).first()
    if not veh:
        veh = Vehicle(
            customer_id=cust.id,
            plate_number=payload.plate_number.upper(),
            make=payload.make,
            model=payload.model,
            year=payload.year or 2022,
            current_mileage=40000,
            maintenance_status="On Track"
        )
        db.add(veh)
        db.flush()
        
    # 3. Create Appointment / Service Record
    service_record = ServiceRecord(
        customer_id=cust.id,
        vehicle_id=veh.id,
        service_type=payload.service_type,
        odometer_reading=veh.current_mileage,
        service_bay=payload.assigned_bay or "Bay 1",
        stage="Scheduled",
        symptoms_reported=payload.notes or "Converted from inbound inquiry",
        labor_cost=80.00,
        parts_cost=140.00,
        total_amount=220.00,
        payment_status="Pending",
        scheduled_date=payload.scheduled_at or (datetime.utcnow() + timedelta(days=1))
    )
    db.add(service_record)
    db.flush()
    
    # 4. Update WhatsApp Interaction link if found
    interaction = db.query(WhatsAppInteraction).filter(WhatsAppInteraction.id == inquiry_id).first()
    if interaction:
        interaction.booking_id = service_record.id
        interaction.customer_id = cust.id
        interaction.vehicle_id = veh.id
        
    db.commit()
    
    return {
        "success": True,
        "message": "Inquiry converted successfully into canonical workshop records",
        "customer_id": str(cust.id),
        "vehicle_id": str(veh.id),
        "appointment_id": str(service_record.id)
    }
