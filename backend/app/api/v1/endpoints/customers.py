from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.service_record import ServiceRecord
from app.models.whatsapp_interaction import WhatsAppInteraction
from app.models.predictive_score import PredictiveScore
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, VehicleBrief

router = APIRouter()


def _format_customer_response(c: Customer) -> CustomerResponse:
    vehicles_brief = [
        VehicleBrief(
            id=v.id,
            plate_number=v.plate_number,
            make=v.make,
            model=v.model,
            year=v.year,
            current_mileage=v.current_mileage,
            maintenance_status=v.maintenance_status,
            next_service_due_date=v.next_service_due_date,
            next_service_due_mileage=v.next_service_due_mileage
        )
        for v in (c.vehicles or [])
    ]
    primary_veh = f"{c.vehicles[0].make} {c.vehicles[0].model} ({c.vehicles[0].plate_number})" if c.vehicles else "Private Vehicle"
    return CustomerResponse(
        id=c.id,
        full_name=c.full_name,
        name=c.full_name,
        phone=c.phone,
        email=c.email,
        address=c.address,
        customer_type=c.customer_type,
        company=primary_veh,
        status=c.status,
        health_score=c.health_score,
        churn_risk=c.churn_risk,
        sentiment=c.sentiment,
        total_spent=float(c.total_spent),
        mrr=float(c.total_spent),
        visit_count=c.visit_count,
        tags=c.tags or [],
        notes=c.notes,
        last_visit_at=c.last_visit_at,
        last_contacted_at=c.last_visit_at,
        created_at=c.created_at,
        updated_at=c.updated_at,
        vehicles=vehicles_brief
    )


@router.get("", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = None,
    status: Optional[str] = None,
    churn_risk: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Customer)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Customer.full_name.ilike(s),
                Customer.phone.ilike(s),
                Customer.email.ilike(s),
                Customer.vehicles.any(Vehicle.plate_number.ilike(s)),
                Customer.vehicles.any(Vehicle.make.ilike(s)),
                Customer.vehicles.any(Vehicle.model.ilike(s))
            )
        )

    if status:
        query = query.filter(Customer.status == status)

    if churn_risk:
        query = query.filter(Customer.churn_risk == churn_risk)

    customers = query.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()
    return [_format_customer_response(c) for c in customers]


@router.post("", response_model=CustomerResponse, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    """Register a new customer entity with optional vehicle creation."""
    existing = db.query(Customer).filter(Customer.phone == payload.phone.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this phone number already exists.")

    customer_name = payload.full_name or payload.name or "New Customer"
    customer = Customer(
        full_name=customer_name,
        phone=payload.phone.strip(),
        email=payload.email,
        address=payload.address,
        customer_type=payload.customer_type,
        status=payload.status,
        health_score=payload.health_score,
        churn_risk=payload.churn_risk,
        sentiment=payload.sentiment,
        total_spent=payload.total_spent or payload.mrr or 0.0,
        tags=payload.tags or ["New Intake"],
        notes=payload.notes
    )
    db.add(customer)
    db.flush()

    # If vehicle info is provided, create vehicle
    if payload.vehicle_plate:
        plate = payload.vehicle_plate.strip().upper()
        veh = Vehicle(
            customer_id=customer.id,
            plate_number=plate,
            make=payload.vehicle_make or "Vehicle",
            model=payload.vehicle_model or "Model",
            year=payload.vehicle_year or 2021,
            current_mileage=payload.vehicle_mileage or 0,
            maintenance_status="On Track"
        )
        db.add(veh)

    db.commit()
    db.refresh(customer)
    return _format_customer_response(customer)


@router.get("/{customer_id}")
def get_customer_360(customer_id: str, db: Session = Depends(get_db)):
    """Retrieve complete 360-degree customer record with vehicles, work orders, and chats."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    vehicles = db.query(Vehicle).filter(Vehicle.customer_id == customer_id).all()
    service_records = db.query(ServiceRecord).filter(ServiceRecord.customer_id == customer_id).order_by(ServiceRecord.created_at.desc()).all()
    interactions = db.query(WhatsAppInteraction).filter(WhatsAppInteraction.customer_id == customer_id).order_by(WhatsAppInteraction.created_at.desc()).all()
    latest_score = db.query(PredictiveScore).filter(PredictiveScore.customer_id == customer_id).order_by(PredictiveScore.generated_at.desc()).first()

    return {
        "customer": _format_customer_response(customer),
        "vehicles": vehicles,
        "service_records": service_records,
        "deals": service_records, # legacy alias for deal view
        "interactions": interactions,
        "predictive_score": latest_score
    }


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: str, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and not update_data.get("full_name"):
        customer.full_name = update_data["name"]

    for field, value in update_data.items():
        if hasattr(customer, field):
            setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return _format_customer_response(customer)


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    db.delete(customer)
    db.commit()
    return None
