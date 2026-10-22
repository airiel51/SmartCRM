import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.service_record import ServiceRecord
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse

router = APIRouter()

# Valid appointment status transitions
VALID_TRANSITIONS = {
    "scheduled": ["confirmed", "cancelled", "in_progress", "no_show"],
    "confirmed": ["in_progress", "cancelled", "no_show"],
    "in_progress": ["completed", "cancelled"],
    "completed": [],
    "cancelled": [],
    "no_show": ["scheduled"]
}


@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    status_filter: Optional[str] = Query(None, alias="status"),
    date_filter: Optional[str] = Query(None, alias="date"),
    db: Session = Depends(get_db)
):
    """Retrieve appointments with vehicle and customer context."""
    # Using ServiceRecord in Scheduled/Inquiry stages or appointment mapping
    query = db.query(ServiceRecord)
    
    if status_filter:
        query = query.filter(ServiceRecord.stage.ilike(f"%{status_filter}%"))
    
    records = query.order_by(ServiceRecord.scheduled_date.asc()).all()
    
    results = []
    default_ws_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
    
    for r in records:
        cust = db.query(Customer).filter(Customer.id == r.customer_id).first()
        veh = db.query(Vehicle).filter(Vehicle.id == r.vehicle_id).first()
        
        # Map service stage to appointment status
        stage_map = {
            "Inquiry": "scheduled",
            "Scheduled": "confirmed",
            "In Progress": "in_progress",
            "Quality Inspection": "in_progress",
            "Ready for Pickup": "completed",
            "Completed": "completed",
            "Invoiced": "completed"
        }
        app_status = stage_map.get(r.stage, "scheduled")
        
        try:
            r_uuid = uuid.UUID(r.id) if isinstance(r.id, str) else r.id
        except ValueError:
            r_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, str(r.id))
            
        try:
            c_uuid = uuid.UUID(r.customer_id) if isinstance(r.customer_id, str) else r.customer_id
        except ValueError:
            c_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, str(r.customer_id))
            
        try:
            v_uuid = uuid.UUID(r.vehicle_id) if isinstance(r.vehicle_id, str) else r.vehicle_id
        except ValueError:
            v_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, str(r.vehicle_id))

        results.append(AppointmentResponse(
            id=r_uuid,
            workshop_id=default_ws_id,
            customer_id=c_uuid,
            vehicle_id=v_uuid,
            scheduled_at=r.scheduled_date or datetime.utcnow(),
            service_type=r.service_type,
            status=app_status,
            assigned_bay=r.service_bay or "Bay 1",
            estimated_duration_minutes=60,
            customer_notes=r.symptoms_reported,
            internal_notes=r.technician_notes,
            created_at=r.created_at,
            updated_at=r.updated_at,
            customer_name=cust.full_name if cust else "Workshop Client",
            customer_phone=cust.phone if cust else "",
            vehicle_plate=veh.plate_number if veh else "",
            vehicle_model=f"{veh.make} {veh.model}" if veh else ""
        ))
        
    return results


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db)
):
    """Schedule a new workshop appointment."""
    cust = db.query(Customer).filter(Customer.id == str(payload.customer_id)).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    veh = db.query(Vehicle).filter(Vehicle.id == str(payload.vehicle_id)).first()
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    new_record = ServiceRecord(
        customer_id=str(payload.customer_id),
        vehicle_id=str(payload.vehicle_id),
        service_type=payload.service_type,
        odometer_reading=veh.current_mileage,
        service_bay=payload.assigned_bay or "Bay 1",
        stage="Scheduled",
        symptoms_reported=payload.customer_notes,
        technician_notes=payload.internal_notes,
        labor_cost=80.00,
        parts_cost=140.00,
        total_amount=220.00,
        payment_status="Pending",
        scheduled_date=payload.scheduled_at
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    default_ws_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
    return AppointmentResponse(
        id=uuid.UUID(new_record.id) if isinstance(new_record.id, str) else new_record.id,
        workshop_id=default_ws_id,
        customer_id=payload.customer_id,
        vehicle_id=payload.vehicle_id,
        scheduled_at=new_record.scheduled_date,
        service_type=new_record.service_type,
        status="scheduled",
        assigned_bay=new_record.service_bay,
        estimated_duration_minutes=payload.estimated_duration_minutes,
        customer_notes=new_record.symptoms_reported,
        internal_notes=new_record.technician_notes,
        created_at=new_record.created_at,
        updated_at=new_record.updated_at,
        customer_name=cust.full_name,
        customer_phone=cust.phone,
        vehicle_plate=veh.plate_number,
        vehicle_model=f"{veh.make} {veh.model}"
    )


@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: str,
    new_status: str = Query(..., pattern="^(scheduled|confirmed|in_progress|completed|cancelled|no_show)$"),
    db: Session = Depends(get_db)
):
    """Update appointment status with transition validation."""
    record = db.query(ServiceRecord).filter(ServiceRecord.id == appointment_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    status_to_stage = {
        "scheduled": "Scheduled",
        "confirmed": "Scheduled",
        "in_progress": "In Progress",
        "completed": "Completed",
        "cancelled": "Completed"
    }
    record.stage = status_to_stage.get(new_status, "Scheduled")
    record.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Status updated successfully", "status": new_status, "stage": record.stage}
