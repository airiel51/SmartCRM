from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.vehicle import Vehicle
from app.models.customer import Customer
from app.models.whatsapp_interaction import WhatsAppInteraction
from app.ai.retention_engine import retention_engine
from app.schemas.ai import RetentionScanResponse, SendReminderRequest, SendReminderResponse

router = APIRouter()


@router.get("/scan", response_model=RetentionScanResponse)
def run_retention_scan(db: Session = Depends(get_db)):
    """
    Runs autonomous maintenance interval scan over all vehicles in the database,
    evaluating oil, brake, and major service thresholds.
    """
    vehicles = db.query(Vehicle).all()
    vehicles_data = []
    for v in vehicles:
        cust = v.customer
        vehicles_data.append({
            "id": v.id,
            "customer_id": v.customer_id,
            "customer_name": cust.full_name if cust else "Valued Customer",
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

    scan_res = retention_engine.scan_fleet(vehicles_data)
    return RetentionScanResponse(
        total_vehicles_scanned=scan_res["total_vehicles_scanned"],
        overdue_count=scan_res["overdue_count"],
        due_soon_count=scan_res["due_soon_count"],
        on_track_count=scan_res["on_track_count"],
        overdue_vehicles=scan_res["overdue_vehicles"] + scan_res["due_soon_vehicles"],
        scan_timestamp=datetime.utcnow()
    )


@router.post("/send-reminder", response_model=SendReminderResponse)
def trigger_whatsapp_reminder(payload: SendReminderRequest, db: Session = Depends(get_db)):
    """
    Simulates sending an automated WhatsApp reminder to an overdue vehicle owner
    and logs the outbound message for workshop tracking.
    """
    veh = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
    cust = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    interaction = WhatsAppInteraction(
        customer_id=cust.id,
        vehicle_id=veh.id if veh else None,
        phone=payload.phone,
        direction="Outbound",
        raw_message=payload.message,
        nlp_extracted_intent="Maintenance Reminder Broadcast",
        nlp_extracted_plate=veh.plate_number if veh else None,
        sentiment_score=0.200,
        urgency="Normal",
        auto_reply_sent=payload.message
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return SendReminderResponse(
        success=True,
        phone=payload.phone,
        message_sent=payload.message,
        interaction_id=interaction.id,
        timestamp=datetime.utcnow()
    )
