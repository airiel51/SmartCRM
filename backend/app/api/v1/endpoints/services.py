from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.service_record import ServiceRecord
from app.models.vehicle import Vehicle
from app.models.customer import Customer
from app.schemas.service_record import ServiceRecordCreate, ServiceRecordUpdate, ServiceRecordResponse

router = APIRouter()


@router.get("", response_model=List[ServiceRecordResponse])
def get_service_records(
    stage: Optional[str] = Query(None, description="Filter by Kanban stage"),
    customer_id: Optional[str] = Query(None),
    vehicle_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ServiceRecord)
    if stage:
        query = query.filter(ServiceRecord.stage == stage)
    if customer_id:
        query = query.filter(ServiceRecord.customer_id == customer_id)
    if vehicle_id:
        query = query.filter(ServiceRecord.vehicle_id == vehicle_id)

    records = query.order_by(ServiceRecord.created_at.desc()).all()
    results = []
    for r in records:
        res = ServiceRecordResponse.model_validate(r)
        if r.customer:
            res.customer_name = r.customer.full_name
            res.customer_phone = r.customer.phone
        if r.vehicle:
            res.vehicle_plate = r.vehicle.plate_number
            res.vehicle_model = f"{r.vehicle.make} {r.vehicle.model}"
        # Set legacy aliases for deal pipeline compatibility
        res.title = r.title
        res.value = float(r.total_amount)
        res.win_probability = r.win_probability
        results.append(res)
    return results


@router.post("", response_model=ServiceRecordResponse, status_code=201)
def create_service_record(data: ServiceRecordCreate, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    veh = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    record = ServiceRecord(
        customer_id=data.customer_id,
        vehicle_id=data.vehicle_id,
        service_type=data.service_type,
        odometer_reading=data.odometer_reading or veh.current_mileage,
        service_bay=data.service_bay,
        stage=data.stage,
        symptoms_reported=data.symptoms_reported,
        diagnosis=data.diagnosis,
        parts_list=data.parts_list,
        labor_cost=data.labor_cost,
        parts_cost=data.parts_cost,
        total_amount=data.labor_cost + data.parts_cost if (data.labor_cost and data.parts_cost) else data.total_amount,
        payment_status=data.payment_status,
        scheduled_date=data.scheduled_date or datetime.utcnow(),
        technician_notes=data.technician_notes
    )
    db.add(record)
    
    # Update customer spend & last visit if invoiced or ready
    if data.stage in ["Ready for Pickup", "Completed", "Invoiced"]:
        cust.total_spent = float(cust.total_spent) + float(record.total_amount)
        cust.last_visit_at = datetime.utcnow()
        cust.visit_count += 1

    db.commit()
    db.refresh(record)

    res = ServiceRecordResponse.model_validate(record)
    res.customer_name = cust.full_name
    res.customer_phone = cust.phone
    res.vehicle_plate = veh.plate_number
    res.vehicle_model = f"{veh.make} {veh.model}"
    res.title = record.title
    res.value = float(record.total_amount)
    res.win_probability = record.win_probability
    return res


@router.patch("/{record_id}/stage", response_model=ServiceRecordResponse)
def update_service_stage(
    record_id: str,
    stage: str = Query(..., description="Target Kanban stage"),
    service_bay: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    r = db.query(ServiceRecord).filter(ServiceRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Service record not found")

    valid_stages = ["Inquiry", "Scheduled", "In Progress", "Quality Inspection", "Ready for Pickup", "Completed", "Invoiced"]
    if stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of {valid_stages}")

    r.stage = stage
    if service_bay:
        r.service_bay = service_bay

    if stage == "In Progress" and not r.started_at:
        r.started_at = datetime.utcnow()
    elif stage in ["Ready for Pickup", "Completed", "Invoiced"] and not r.completed_at:
        r.completed_at = datetime.utcnow()
        if r.customer:
            r.customer.last_visit_at = datetime.utcnow()

    db.commit()
    db.refresh(r)

    res = ServiceRecordResponse.model_validate(r)
    if r.customer:
        res.customer_name = r.customer.full_name
        res.customer_phone = r.customer.phone
    if r.vehicle:
        res.vehicle_plate = r.vehicle.plate_number
        res.vehicle_model = f"{r.vehicle.make} {r.vehicle.model}"
    res.title = r.title
    res.value = float(r.total_amount)
    res.win_probability = r.win_probability
    return res
