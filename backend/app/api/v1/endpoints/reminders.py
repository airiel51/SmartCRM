import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.whatsapp_interaction import WhatsAppInteraction
from app.schemas.reminder import ServiceReminderResponse, ServiceReminderUpdate

router = APIRouter()

DEFAULT_WORKSHOP_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")


@router.get("", response_model=List[ServiceReminderResponse])
def get_reminders(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """
    Compute and return workshop service interval reminders.
    Transparently categorizes vehicles into upcoming, due, and overdue based on mileage and elapsed days.
    """
    vehicles = db.query(Vehicle).all()
    reminders = []
    now = datetime.utcnow()
    
    for v in vehicles:
        cust = db.query(Customer).filter(Customer.id == v.customer_id).first()
        if not cust:
            continue
            
        # Determine status based on dates & mileage
        calc_status = "upcoming"
        priority = "normal"
        reminder_type = "oil_change"
        
        km_overdue = max(0, v.current_mileage - (v.next_service_due_mileage or 50000))
        days_until_due = (v.next_service_due_date - now).days if v.next_service_due_date else 30
        
        if km_overdue > 0 or days_until_due < 0:
            calc_status = "overdue"
            priority = "urgent"
        elif days_until_due <= 14 or (v.next_service_due_mileage and (v.next_service_due_mileage - v.current_mileage) <= 500):
            calc_status = "due"
            priority = "high"
        else:
            calc_status = "upcoming"
            priority = "normal"
            
        if status_filter and calc_status != status_filter:
            continue
            
        # Determine reminder type
        if v.current_mileage >= 40000 and (v.current_mileage % 40000) <= 5000:
            reminder_type = "major_service"
        elif "Full Synthetic" in (v.oil_type or "Full Synthetic"):
            reminder_type = "synthetic_oil"
        else:
            reminder_type = "oil_change"
            
        v_uuid = uuid.UUID(v.id) if isinstance(v.id, str) else v.id
        c_uuid = uuid.UUID(cust.id) if isinstance(cust.id, str) else cust.id
        rem_id = uuid.uuid5(v_uuid, f"{reminder_type}_{calc_status}")
        
        reminders.append(ServiceReminderResponse(
            id=rem_id,
            workshop_id=DEFAULT_WORKSHOP_ID,
            vehicle_id=v_uuid,
            customer_id=c_uuid,
            reminder_type=reminder_type,
            due_date=v.next_service_due_date or (now + timedelta(days=30)),
            due_mileage=v.next_service_due_mileage or 50000,
            status=calc_status,
            priority=priority,
            last_sent_at=None,
            send_count=1 if calc_status == "overdue" else 0,
            notes=f"Current mileage: {v.current_mileage:,} km. Daily rate: {v.daily_mileage_rate or 40} km/day.",
            created_at=v.created_at,
            updated_at=v.updated_at,
            customer_name=cust.full_name,
            customer_phone=cust.phone,
            vehicle_plate=v.plate_number,
            vehicle_model=f"{v.make} {v.model}",
            current_mileage=v.current_mileage
        ))
        
    return reminders


@router.post("/{reminder_id}/send-whatsapp")
def send_reminder_whatsapp(
    reminder_id: str,
    phone: str = Query(...),
    message: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Adapter endpoint to send simulated or official WhatsApp reminder.
    Logs interaction honestly without sending real messages in demo mode.
    """
    cust = db.query(Customer).filter(Customer.phone == phone).first()
    
    interaction = WhatsAppInteraction(
        customer_id=cust.id if cust else None,
        phone=phone,
        direction="Outbound",
        raw_message=message,
        nlp_extracted_intent="Service Reminder",
        sentiment_score=0.5,
        urgency="Normal",
        auto_reply_sent="Delivered (Simulated WhatsApp Cloud API Adapter)"
    )
    db.add(interaction)
    db.commit()
    
    return {
        "success": True,
        "mode": "demo_simulated",
        "recipient": phone,
        "status": "simulated_sent",
        "timestamp": datetime.utcnow().isoformat(),
        "notice": "Simulated WhatsApp Adapter Active. No real customer messages sent."
    }
